import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Comment, Label } from '@/models';

const VALID_LABELS = ['Hope', 'Fear', 'Determination', 'Neutral', 'Skip'];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, commentId, label } = body;

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Valid annotator name is required' },
        { status: 400 }
      );
    }

    // Validate commentId
    if (!commentId || !Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Valid comment ID is required' },
        { status: 400 }
      );
    }

    // Validate label
    if (!label || !VALID_LABELS.includes(label)) {
      return NextResponse.json(
        { error: `Label must be one of: ${VALID_LABELS.join(', ')}` },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Check for duplicate labeling
    const existingLabel = await Label.findOne({
      userName: name.trim(),
      commentId: new Types.ObjectId(commentId),
    });

    if (existingLabel) {
      return NextResponse.json(
        { error: 'You have already labeled this comment' },
        { status: 400 }
      );
    }

    // Create new label
    await Label.create({
      userName: name.trim(),
      commentId: new Types.ObjectId(commentId),
      label,
    });

    // Special case: If label is "Skip", don't update comment stats
    if (label === 'Skip') {
      // Get current comment data for response
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          id: comment._id,
          finalLabel: comment.finalLabel,
          status: comment.status,
          labelCount: comment.labelCount,
        },
        { status: 200 }
      );
    }

    // Fetch all NON-SKIP labels for this comment
    const allLabels = await Label.find({
      commentId: new Types.ObjectId(commentId),
      label: { $ne: 'Skip' }, // Exclude Skip labels
    });

    const labelCount = allLabels.length;

    // Recompute finalLabel and status
    let finalLabel: string | null = null;
    let status: 'open' | 'resolved' | 'needs_admin_review' = 'open';

    if (labelCount < 2) {
      // Not enough labels yet
      finalLabel = null;
      status = 'open';
    } else if (labelCount === 2) {
      // Check if both labels are the same
      const [label1, label2] = allLabels.map((l) => l.label);
      if (label1 === label2) {
        finalLabel = label1;
        status = 'resolved';
      } else {
        finalLabel = null;
        status = 'open';
      }
    } else {
      // labelCount >= 3: Count votes for each label (excluding Skip)
      const voteCounts: Record<string, number> = {};
      allLabels.forEach((l) => {
        voteCounts[l.label] = (voteCounts[l.label] || 0) + 1;
      });

      // Find the maximum vote count
      const maxVotes = Math.max(...Object.values(voteCounts));
      const topLabels = Object.keys(voteCounts).filter(
        (lbl) => voteCounts[lbl] === maxVotes
      );

      if (topLabels.length === 1) {
        // Clear majority
        finalLabel = topLabels[0];
        status = 'resolved';
      } else {
        // Tie for top label
        finalLabel = null;
        status = 'needs_admin_review';
      }
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        labelCount,
        finalLabel,
        status,
      },
      { new: true }
    );

    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Return the updated comment
    return NextResponse.json(
      {
        id: updatedComment._id,
        finalLabel: updatedComment.finalLabel,
        status: updatedComment.status,
        labelCount: updatedComment.labelCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting label:', error);
    return NextResponse.json(
      { error: 'Failed to submit label' },
      { status: 500 }
    );
  }
}
