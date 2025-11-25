import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Comment, Label } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get the annotator name from query parameters
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Annotator name is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find all comment IDs that this user has already labeled
    const userLabels = await Label.find({ userName: name.trim() }).select('commentId');
    const labeledCommentIds = userLabels.map((label) => label.commentId);

    // Query comments that:
    // 1. Are still open
    // 2. Have less than 3 labels
    // 3. Have NOT been labeled by this user
    const comments = await Comment.find({
      status: 'open',
      labelCount: { $lt: 3 },
      _id: { $nin: labeledCommentIds },
    })
      .select('_id text') // Only return _id and text
      .sort({ labelCount: 1 }) // Prioritize comments with fewer labels
      .limit(50); // Return up to 50 comments

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('Error fetching next batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
