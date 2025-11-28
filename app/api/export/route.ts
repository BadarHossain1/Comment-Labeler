import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Comment, Label } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Optional admin key protection
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const adminKey = process.env.ADMIN_KEY;

    if (adminKey && key !== adminKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing admin key' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find all comments with at least 1 label
    const comments = await Comment.find({
      labelCount: { $gte: 1 },
    })
      .select('_id text finalLabel labelCount status')
      .sort({ createdAt: -1 })
      .lean();

    if (comments.length === 0) {
      return new NextResponse('No labeled comments found', { status: 404 });
    }

    // Get all labels for these comments
    const commentIds = comments.map(c => c._id);
    const allLabels = await Label.find({ commentId: { $in: commentIds } })
      .select('commentId userName label createdAt')
      .sort({ createdAt: 1 })
      .lean();

    // Group labels by comment
    const labelsByComment = new Map();
    allLabels.forEach(label => {
      const commentId = label.commentId.toString();
      if (!labelsByComment.has(commentId)) {
        labelsByComment.set(commentId, []);
      }
      labelsByComment.get(commentId).push({
        userName: label.userName,
        label: label.label
      });
    });

    // Get all unique annotators
    const allAnnotators = [...new Set(allLabels.map(l => l.userName))].sort();

    // Helper function to calculate Fleiss' Kappa for a single item
    const calculateFleissKappa = (labelCounts: Map<string, number>, totalRaters: number): number | null => {
      if (totalRaters < 2) return null;
      
      const n = totalRaters;
      
      // Calculate Pi (proportion of agreement for this item)
      let sumSquares = 0;
      labelCounts.forEach(count => {
        sumSquares += count * count;
      });
      
      const Pi = (sumSquares - n) / (n * (n - 1));
      
      // Calculate Pe (expected agreement by chance)
      let Pe = 0;
      labelCounts.forEach(count => {
        const pj = count / n;
        Pe += pj * pj;
      });
      
      // Calculate Kappa
      if (Pe >= 1) return 1;
      if (Pe <= 0) return 0;
      
      const kappa = (Pi - Pe) / (1 - Pe);
      
      return Math.round(Math.max(-1, Math.min(1, kappa)) * 1000) / 1000;
    };

    // Build CSV data
    const csvRows: string[] = [];
    
    // CSV Header - Dynamic columns based on annotators
    const headerCols = ['Comment ID', 'Comment Text', 'Majority Label', 'Final Label', 'Status', 'Total Labels'];
    allAnnotators.forEach(annotator => {
      headerCols.push(`${annotator}'s Label`);
    });
    headerCols.push('Agreement %', 'Fleiss Kappa');
    csvRows.push(headerCols.join(','));

    // Escape CSV fields (handle commas, quotes, newlines in text)
    const escapeCsvField = (field: string | null | number): string => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Process each comment
    for (const comment of comments) {
      const commentId = comment._id.toString();
      const labels = labelsByComment.get(commentId) || [];

      // Create a map of userName to label
      const userLabelMap = new Map();
      labels.forEach((l: { userName: string; label: string }) => {
        userLabelMap.set(l.userName, l.label);
      });

      // Calculate agreement percentage and Fleiss' Kappa
      const validLabels = labels.filter((l: { label: string }) => l.label !== 'Skip');
      let agreementPercentage = '';
      let majorityLabel = '';
      let fleissKappa = '';
      
      if (validLabels.length >= 2) {
        const labelCounts = new Map<string, number>();
        validLabels.forEach((l: { label: string }) => {
          labelCounts.set(l.label, (labelCounts.get(l.label) || 0) + 1);
        });
        
        // Find majority label
        let maxCount = 0;
        labelCounts.forEach((count, label) => {
          if (count > maxCount) {
            maxCount = count;
            majorityLabel = label;
          }
        });
        
        agreementPercentage = Math.round((maxCount / validLabels.length) * 100) + '%';
        
        // Calculate Fleiss' Kappa
        const kappa = calculateFleissKappa(labelCounts, validLabels.length);
        fleissKappa = kappa !== null ? kappa.toFixed(3) : '';
      } else if (validLabels.length === 1) {
        majorityLabel = validLabels[0].label;
        agreementPercentage = '100%';
        fleissKappa = 'N/A';
      }

      // Build row data
      const rowData = [
        escapeCsvField(commentId),
        escapeCsvField(comment.text),
        escapeCsvField(majorityLabel || 'No Consensus'),
        escapeCsvField(comment.finalLabel || 'Not Set'),
        escapeCsvField(comment.status || 'open'),
        escapeCsvField(labels.length),
      ];

      // Add each annotator's label (or empty if they didn't label this comment)
      allAnnotators.forEach(annotator => {
        const label = userLabelMap.get(annotator) || '';
        rowData.push(escapeCsvField(label));
      });

      // Add agreement percentage and Fleiss' Kappa
      rowData.push(escapeCsvField(agreementPercentage));
      rowData.push(escapeCsvField(fleissKappa));

      csvRows.push(rowData.join(','));
    }

    // Join all rows with newlines
    const csvContent = csvRows.join('\n');

    // Return CSV file with download headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="futureemo_labels.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting labels:', error);
    return NextResponse.json(
      { error: 'Failed to export labels' },
      { status: 500 }
    );
  }
}
