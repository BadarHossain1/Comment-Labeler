import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Comment } from '@/models';

const VALID_LABELS = ['Hope', 'Fear', 'Determination', 'Neutral', null];
const VALID_STATUSES = ['open', 'resolved', 'needs_admin_review'];

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { commentId, finalLabel, status } = body;

    // Validate commentId
    if (!commentId || !Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Valid comment ID is required' },
        { status: 400 }
      );
    }

    // Validate finalLabel if provided
    if (finalLabel !== undefined && !VALID_LABELS.includes(finalLabel)) {
      return NextResponse.json(
        { error: `finalLabel must be one of: Hope, Fear, Determination, Neutral, or null` },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Apply updates with business logic
    if (finalLabel !== undefined) {
      comment.finalLabel = finalLabel;
      
      // If finalLabel is set and status not explicitly provided, mark as resolved
      if (finalLabel !== null && status === undefined) {
        comment.status = 'resolved';
      }
    }

    if (status !== undefined) {
      comment.status = status;
      
      // If status is "open", clear finalLabel
      if (status === 'open') {
        comment.finalLabel = null;
      }
    }

    // Save the updated comment
    await comment.save();

    // Return the updated comment
    return NextResponse.json(
      {
        id: comment._id,
        text: comment.text,
        finalLabel: comment.finalLabel,
        status: comment.status,
        labelCount: comment.labelCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
