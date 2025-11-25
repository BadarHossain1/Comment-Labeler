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

    // Find resolved comments with finalLabel and at least 2 labels
    const resolvedComments = await Comment.find({
      status: 'resolved',
      finalLabel: { $ne: null },
      labelCount: { $gte: 2 },
    }).select('_id text finalLabel labelCount');

    // Build CSV data
    const csvRows: string[] = [];
    
    // CSV Header
    csvRows.push('commentId,text,finalLabel,labelCount,labelsDetail');

    // Process each comment
    for (const comment of resolvedComments) {
      // Fetch all labels for this comment
      const labels = await Label.find({ commentId: comment._id })
        .select('userName label')
        .sort({ createdAt: 1 });

      // Build labelsDetail: "userName:label;userName:label;..."
      const labelsDetail = labels
        .map((l) => `${l.userName}:${l.label}`)
        .join(';');

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

      // Add row
      csvRows.push(
        [
          escapeCsvField(comment._id.toString()),
          escapeCsvField(comment.text),
          escapeCsvField(comment.finalLabel),
          escapeCsvField(comment.labelCount),
          escapeCsvField(labelsDetail),
        ].join(',')
      );
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
