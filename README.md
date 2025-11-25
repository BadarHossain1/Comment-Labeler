# FutureEmo-ENG Comment Labeller 🎯

A stunning, modern web application for labeling future-oriented emotions in social media comments. Built with Next.js 16, MongoDB, and premium UI/UX design.

## ✨ Features

- **Beautiful UI/UX**: Glassmorphism design with animated gradients and smooth transitions
- **Emotion Labeling**: Classify comments as Hope, Fear, Determination, Neutral, or Skip
- **Voting System**: Smart 2-3 vote consensus mechanism
- **Admin Dashboard**: Real-time statistics, quality metrics, and CSV export
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Production Ready**: Optimized for Vercel deployment

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and admin key

# Seed the database (one-time)
npm run seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_KEY=your_secure_admin_key
```

## 📦 Tech Stack

- **Framework**: Next.js 16.0.4 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5
- **Runtime**: React 19.2.0

## 🎨 Pages

- `/` - Home page with annotator registration
- `/label` - Main labeling interface
- `/guidelines` - Detailed labeling instructions
- `/admin` - Admin dashboard (requires admin key)

## 📊 Admin Features

- View overall statistics
- Export resolved comments to CSV
- Monitor annotator quality metrics
- Track agreement rates

## 🌐 Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

1. Click "Deploy" button above
2. Add environment variables in Vercel dashboard
3. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with comments
- `npm run lint` - Run ESLint

## 🎯 Emotion Categories

- **Hope** 🌟 - Optimistic about future
- **Fear** ⚠️ - Worried about future
- **Determination** 💪 - Committed to action
- **Neutral** 😐 - No strong emotion
- **Skip** ⏭️ - Not future-oriented

## 📄 License

MIT

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies
