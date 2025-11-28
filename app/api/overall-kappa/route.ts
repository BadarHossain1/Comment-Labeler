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

    // Get all comments with at least 2 labels
    const comments = await Comment.find({ labelCount: { $gte: 2 } })
      .select('_id')
      .lean();

    if (comments.length === 0) {
      return NextResponse.json({
        overallKappa: null,
        message: 'No comments with multiple labels found',
        totalComments: 0,
        totalRaters: 0,
        categories: []
      });
    }

    const commentIds = comments.map(c => c._id);

    // Get all labels for these comments (excluding 'Skip')
    const allLabels = await Label.find({ 
      commentId: { $in: commentIds },
      label: { $ne: 'Skip' }
    })
      .select('commentId label')
      .lean();

    // Group labels by comment
    const labelsByComment = new Map<string, string[]>();
    allLabels.forEach(label => {
      const commentId = label.commentId.toString();
      if (!labelsByComment.has(commentId)) {
        labelsByComment.set(commentId, []);
      }
      labelsByComment.get(commentId)!.push(label.label);
    });

    // Filter to only include comments with at least 2 valid labels
    const validComments = Array.from(labelsByComment.entries())
      .filter(([_, labels]) => labels.length >= 2);

    if (validComments.length === 0) {
      return NextResponse.json({
        overallKappa: null,
        message: 'No comments with at least 2 valid labels found',
        totalComments: 0,
        totalRaters: 0,
        categories: []
      });
    }

    // Get all unique categories (label types)
    const allCategories = new Set<string>();
    validComments.forEach(([_, labels]) => {
      labels.forEach(label => allCategories.add(label));
    });
    const categories = Array.from(allCategories).sort();

    // Calculate overall Fleiss' Kappa
    // N = number of subjects (comments)
    // n = number of raters per subject (can vary)
    // k = number of categories
    const N = validComments.length;
    const k = categories.length;

    // Calculate P̄ (mean observed agreement across all subjects)
    let sumPi = 0;
    const totalRatersPerComment: number[] = [];

    validComments.forEach(([_, labels]) => {
      const n = labels.length;
      totalRatersPerComment.push(n);
      
      // Count occurrences of each category for this comment
      const counts = new Map<string, number>();
      categories.forEach(cat => counts.set(cat, 0));
      labels.forEach(label => {
        counts.set(label, (counts.get(label) || 0) + 1);
      });

      // Calculate Pi for this subject
      // Pi = (1 / (n * (n-1))) * (Σnij² - n)
      let sumSquares = 0;
      counts.forEach(count => {
        sumSquares += count * count;
      });
      
      const Pi = (sumSquares - n) / (n * (n - 1));
      sumPi += Pi;
    });

    const P_bar = sumPi / N;

    // Calculate P̄e (expected agreement by chance)
    // pj = proportion of all assignments to category j
    const totalAssignments = validComments.reduce((sum, [_, labels]) => sum + labels.length, 0);
    const categoryProportions = new Map<string, number>();
    
    categories.forEach(cat => {
      const count = validComments.reduce((sum, [_, labels]) => {
        return sum + labels.filter(l => l === cat).length;
      }, 0);
      categoryProportions.set(cat, count / totalAssignments);
    });

    let P_bar_e = 0;
    categoryProportions.forEach(pj => {
      P_bar_e += pj * pj;
    });

    // Calculate Fleiss' Kappa: κ = (P̄ - P̄e) / (1 - P̄e)
    let kappa: number | null = null;
    if (P_bar_e < 1) {
      kappa = (P_bar - P_bar_e) / (1 - P_bar_e);
      kappa = Math.round(kappa * 1000) / 1000;
    } else if (P_bar_e === 1 && P_bar === 1) {
      kappa = 1; // Perfect agreement
    }

    // Calculate interpretation
    let interpretation = '';
    if (kappa !== null) {
      if (kappa < 0) interpretation = 'Poor (less than chance)';
      else if (kappa < 0.20) interpretation = 'Slight';
      else if (kappa < 0.40) interpretation = 'Fair';
      else if (kappa < 0.60) interpretation = 'Moderate';
      else if (kappa < 0.80) interpretation = 'Substantial';
      else interpretation = 'Almost Perfect';
    }

    return NextResponse.json({
      overallKappa: kappa,
      interpretation: interpretation,
      P_bar: Math.round(P_bar * 1000) / 1000,
      P_bar_e: Math.round(P_bar_e * 1000) / 1000,
      totalComments: N,
      totalRaters: Math.round(totalRatersPerComment.reduce((a, b) => a + b, 0) / N * 10) / 10,
      categories: categories,
      categoryDistribution: Object.fromEntries(
        Array.from(categoryProportions.entries()).map(([cat, prop]) => [
          cat,
          Math.round(prop * 100) + '%'
        ])
      ),
      details: {
        formula: 'κ = (P̄ - P̄e) / (1 - P̄e)',
        description: 'Fleiss Kappa measures inter-rater reliability for multiple raters',
        reference: 'Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin, 76(5), 378-382.'
      }
    });
  } catch (error) {
    console.error('Error calculating overall Fleiss Kappa:', error);
    return NextResponse.json(
      { error: 'Failed to calculate overall Fleiss Kappa' },
      { status: 500 }
    );
  }
}
