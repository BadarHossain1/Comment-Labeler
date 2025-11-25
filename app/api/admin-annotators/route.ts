import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Comment, Label } from '@/models';

interface AnnotatorStats {
  userName: string;
  totalLabels: number;
  agreementCount: number;
  disagreementCount: number;
  disagreementRate: number | null;
  avgTimeBetweenLabelsSeconds: number | null;
}

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

    // Load all non-Skip labels
    const allLabels = await Label.find({ label: { $ne: 'Skip' } }).sort({ createdAt: 1 });

    // Group labels by userName
    const labelsByUser: Record<string, typeof allLabels> = {};
    allLabels.forEach((label) => {
      if (!labelsByUser[label.userName]) {
        labelsByUser[label.userName] = [];
      }
      labelsByUser[label.userName].push(label);
    });

    // Compute stats for each annotator
    const annotatorStats: AnnotatorStats[] = [];

    for (const userName of Object.keys(labelsByUser)) {
      const userLabels = labelsByUser[userName];
      const totalLabels = userLabels.length;

      // Agreement/disagreement stats
      let agreementCount = 0;
      let disagreementCount = 0;

      for (const label of userLabels) {
        // Look up the associated comment
        const comment = await Comment.findById(label.commentId);

        // Only consider resolved comments with a finalLabel
        if (comment && comment.status === 'resolved' && comment.finalLabel !== null) {
          if (label.label === comment.finalLabel) {
            agreementCount++;
          } else {
            disagreementCount++;
          }
        }
      }

      const totalResolvedLabels = agreementCount + disagreementCount;
      const disagreementRate = totalResolvedLabels > 0 
        ? disagreementCount / totalResolvedLabels 
        : null;

      // Average time between labels
      let avgTimeBetweenLabelsSeconds: number | null = null;

      if (userLabels.length >= 2) {
        const timeDifferences: number[] = [];

        for (let i = 1; i < userLabels.length; i++) {
          const prevTime = new Date(userLabels[i - 1].createdAt).getTime();
          const currTime = new Date(userLabels[i].createdAt).getTime();
          const diffSeconds = (currTime - prevTime) / 1000;

          // Ignore gaps longer than 1 hour (3600 seconds)
          if (diffSeconds <= 3600) {
            timeDifferences.push(diffSeconds);
          }
        }

        if (timeDifferences.length > 0) {
          const sum = timeDifferences.reduce((acc, val) => acc + val, 0);
          avgTimeBetweenLabelsSeconds = sum / timeDifferences.length;
        }
      }

      annotatorStats.push({
        userName,
        totalLabels,
        agreementCount,
        disagreementCount,
        disagreementRate,
        avgTimeBetweenLabelsSeconds,
      });
    }

    // Sort by totalLabels descending
    annotatorStats.sort((a, b) => b.totalLabels - a.totalLabels);

    return NextResponse.json(annotatorStats, { status: 200 });
  } catch (error) {
    console.error('Error fetching annotator stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotator statistics' },
      { status: 500 }
    );
  }
}
