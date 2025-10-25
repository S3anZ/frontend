# Vercel Configuration

This file configures the deployment settings for Vercel.

## Build Settings

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Environment Variables

Make sure to set these in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deployment Notes

- The app will automatically deploy on every push to the main branch
- Preview deployments are created for pull requests
- Environment variables are securely stored in Vercel dashboard
