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

    // 1. Total comments
    const totalComments = await Comment.countDocuments();

    // 2. Total labels
    const totalLabels = await Label.countDocuments();

    // 3. Comments with at least one label (labelCount >= 1)
    const commentsWithAtLeastOneLabel = await Comment.countDocuments({
      labelCount: { $gte: 1 },
    });

    // 4. Comments with at least two labels (labelCount >= 2)
    const commentsWithAtLeastTwoLabels = await Comment.countDocuments({
      labelCount: { $gte: 2 },
    });

    // 5. Resolved comments
    const resolvedComments = await Comment.countDocuments({
      status: 'resolved',
    });

    // 6. Needs admin review
    const needsAdminReview = await Comment.countDocuments({
      status: 'needs_admin_review',
    });

    // 7. Open comments
    const openComments = await Comment.countDocuments({
      status: 'open',
    });

    // Compute agreement statistics
    let agreementCount = 0;
    let disagreementCount = 0;
    let agreementRate: number | null = null;

    // Find all comments with at least 2 labels
    const commentsWithMultipleLabels = await Comment.find({
      labelCount: { $gte: 2 },
    }).select('_id');

    // For each comment, check if all labels are the same
    for (const comment of commentsWithMultipleLabels) {
      const labels = await Label.find({ commentId: comment._id }).select('label');
      
      if (labels.length >= 2) {
        const allLabels = labels.map((l) => l.label);
        const firstLabel = allLabels[0];
        const allSame = allLabels.every((label) => label === firstLabel);

        if (allSame) {
          agreementCount++;
        } else {
          disagreementCount++;
        }
      }
    }

    // Calculate agreement rate
    const totalWithMultipleLabels = agreementCount + disagreementCount;
    if (totalWithMultipleLabels > 0) {
      agreementRate = agreementCount / totalWithMultipleLabels;
    }

    // Return statistics
    return NextResponse.json(
      {
        totalComments,
        totalLabels,
        commentsWithAtLeastOneLabel,
        commentsWithAtLeastTwoLabels,
        resolvedComments,
        needsAdminReview,
        openComments,
        agreement: {
          agreementCount,
          disagreementCount,
          agreementRate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
