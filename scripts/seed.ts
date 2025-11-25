import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import connectDB from '../lib/mongodb';
import Comment from '../models/Comment';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

async function seedComments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public', 'FutureEmo Comments - Sheet1.csv');
    console.log(`📖 Reading CSV file from: ${csvPath}`);
    
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n');
    
    // Skip header row and filter out empty lines
    const comments = lines
      .slice(1)
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());

    console.log(`📝 Found ${comments.length} comments in CSV file`);

    let insertedCount = 0;
    let skippedCount = 0;

    // Process each comment
    for (const text of comments) {
      if (!text) continue;

      // Check if comment already exists
      const existingComment = await Comment.findOne({ text });

      if (existingComment) {
        skippedCount++;
        continue;
      }

      // Insert new comment
      await Comment.create({
        text,
        labelCount: 0,
        finalLabel: null,
        status: 'open',
      });

      insertedCount++;

      // Log progress every 100 comments
      if (insertedCount % 100 === 0) {
        console.log(`   ✓ Inserted ${insertedCount} comments...`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`   📊 Total comments processed: ${comments.length}`);
    console.log(`   ✨ New comments inserted: ${insertedCount}`);
    console.log(`   ⏭️  Duplicates skipped: ${skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding comments:', error);
    process.exit(1);
  }
}

// Run the seed function
seedComments();
