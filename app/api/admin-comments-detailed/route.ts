import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Comment, Label } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Check admin key
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

    // Get all comments with their labels
    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .select('_id text finalLabel status labelCount createdAt')
      .lean();

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
        label: label.label,
        createdAt: label.createdAt
      });
    });

    // Helper function to calculate Fleiss' Kappa for a single item
    // This calculates kappa for one comment with multiple raters
    const calculateFleissKappa = (labelCounts: Map<string, number>, totalRaters: number): number | null => {
      if (totalRaters < 2) return null;
      
      const n = totalRaters; // number of raters for this item
      const k = labelCounts.size; // number of categories
      
      // Step 1: Calculate Pi (proportion of agreement for this item)
      // Pi = (1 / (n * (n-1))) * [ Σ(nij² - n) ]
      // where nij is the count for each category
      let sumSquares = 0;
      labelCounts.forEach(count => {
        sumSquares += count * count;
      });
      
      const Pi = (sumSquares - n) / (n * (n - 1));
      
      // Step 2: Calculate Pj (proportion of all assignments to category j)
      // For a single item, this is just the observed proportions
      let Pe = 0;
      labelCounts.forEach(count => {
        const pj = count / n;
        Pe += pj * pj;
      });
      
      // Step 3: Calculate Fleiss' Kappa
      // κ = (P̄ - P̄e) / (1 - P̄e)
      // For single item: κ = (Pi - Pe) / (1 - Pe)
      if (Pe >= 1) return 1; // Perfect agreement
      if (Pe <= 0) return 0; // No agreement expected by chance
      
      const kappa = (Pi - Pe) / (1 - Pe);
      
      // Return value between -1 and 1, rounded to 3 decimals
      return Math.round(Math.max(-1, Math.min(1, kappa)) * 1000) / 1000;
    };

    // Build detailed comment data
    const detailedComments = comments.map(comment => {
      const commentId = comment._id.toString();
      const labels = labelsByComment.get(commentId) || [];
      
      // Filter out 'Skip' labels for agreement calculation
      const validLabels = labels.filter(l => l.label !== 'Skip');
      
      // Calculate agreement percentage and majority label
      let agreementPercentage = null;
      let majorityLabel = null;
      let fleissKappa = null;
      
      if (validLabels.length >= 2) {
        // Count occurrences of each label
        const labelCounts = new Map<string, number>();
        validLabels.forEach(l => {
          labelCounts.set(l.label, (labelCounts.get(l.label) || 0) + 1);
        });
        
        // Find the most common label (majority/consensus)
        let maxCount = 0;
        labelCounts.forEach((count, label) => {
          if (count > maxCount) {
            maxCount = count;
            majorityLabel = label;
          }
        });
        
        // Agreement percentage = (most common label count / total valid labels) * 100
        agreementPercentage = Math.round((maxCount / validLabels.length) * 100);
        
        // Calculate Fleiss' Kappa
        fleissKappa = calculateFleissKappa(labelCounts, validLabels.length);
      } else if (validLabels.length === 1) {
        // Only one label - 100% agreement, no kappa
        majorityLabel = validLabels[0].label;
        agreementPercentage = 100;
        fleissKappa = null;
      }

      // Get unique annotators
      const annotators = [...new Set(labels.map(l => l.userName))];

      return {
        _id: commentId,
        text: comment.text,
        finalLabel: comment.finalLabel,
        status: comment.status,
        labelCount: comment.labelCount,
        labels: labels,
        annotators: annotators,
        agreementPercentage: agreementPercentage,
        majorityLabel: majorityLabel,
        fleissKappa: fleissKappa,
        createdAt: comment.createdAt
      };
    });

    return NextResponse.json(detailedComments, { status: 200 });
  } catch (error) {
    console.error('Error fetching detailed comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed comments' },
      { status: 500 }
    );
  }
}
