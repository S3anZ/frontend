# Deployment Guide for Vercel

## Prerequisites

1. **GitHub Repository**: Your frontend code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Have your Supabase credentials ready

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your frontend folder contains:
- ✅ All Next.js files (`pages/`, `components/`, etc.)
- ✅ `package.json` with correct dependencies
- ✅ `.gitignore` file
- ✅ `.env.example` file
- ✅ `vercel.json` configuration

### 2. Push to GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Deploy on Vercel

1. **Import Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: Leave empty (or set to `frontend` if your repo has multiple folders)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-project-name.vercel.app`

### 4. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version compatibility
   - Check build logs in Vercel dashboard

2. **Environment Variables**:
   - Make sure all required env vars are set
   - Variables must start with `NEXT_PUBLIC_` to be available in browser

3. **API Connection Issues**:
   - Verify your Hugging Face Space is running
   - Check CORS settings if needed
   - Test API endpoints directly

### Useful Commands

```bash
# Test build locally
npm run build
npm start

# Check for linting issues
npm run lint

# Install dependencies
npm install
```

## Monitoring

- **Analytics**: Available in Vercel dashboard
- **Logs**: Check function logs for debugging
- **Performance**: Monitor Core Web Vitals

## Updates

- Every push to main branch triggers automatic deployment
- Pull requests create preview deployments
- Rollback to previous versions available in dashboard
