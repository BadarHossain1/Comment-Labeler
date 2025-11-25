# FutureEmo-ENG Comment Labeller

## Vercel Deployment

This project is ready to deploy on Vercel.

### Environment Variables

Add these to your Vercel project settings:

```
MONGODB_URI=mongodb+srv://luxeUser:1xJJjb8QT2Q2HXfF@cluster0.poncpsr.mongodb.net/?appName=Cluster0
ADMIN_KEY=your_secure_admin_key_here
```

### Deploy Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables in project settings
   - Deploy!

### Automatic Features
- ✅ Next.js 16.0.4 automatically detected
- ✅ MongoDB connection with proper caching
- ✅ API routes optimized for serverless
- ✅ Static assets automatically optimized
- ✅ Edge runtime ready

### Post-Deployment

1. **Seed Database** (one-time):
   ```bash
   npm run seed
   ```

2. **Access Admin Panel**:
   - Visit: `https://your-app.vercel.app/admin`
   - Use ADMIN_KEY from environment variables

3. **Start Labeling**:
   - Visit: `https://your-app.vercel.app`

### URLs
- Home: `/`
- Label: `/label`
- Guidelines: `/guidelines`
- Admin: `/admin`

Your app is production-ready! 🚀
