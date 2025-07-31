# 🚀 Deployment Guide - AI Component Generator

## Vercel Deployment

### Prerequisites
1. GitHub repository with your code
2. Vercel account connected to GitHub
3. MongoDB Atlas database (for production)

### Environment Variables
Set these in your Vercel dashboard:

#### Backend Environment Variables:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/componentgen
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
FRONTEND_URL=https://your-domain.vercel.app
OPENROUTER_API_KEY=your-openrouter-api-key
AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select "Other" framework preset
   - Set root directory to `/` (leave empty)

3. **Configure Build Settings:**
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/.next`
   - Install Command: `npm run install:all`

4. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all the variables listed above

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster

2. **Configure Database:**
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for Vercel)
   - Get connection string

3. **Update Environment Variables:**
   - Replace `MONGO_URI` with your Atlas connection string

### Custom Domain (Optional)

1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Update Environment Variables:**
   - Update `FRONTEND_URL` to your custom domain
   - Update `NEXT_PUBLIC_API_URL` to your custom domain + `/api`

### Troubleshooting

#### Common Issues:

1. **Build Fails:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify environment variables are set

2. **API Routes Not Working:**
   - Check function logs in Vercel dashboard
   - Verify backend environment variables
   - Check MongoDB connection

3. **Frontend Not Loading:**
   - Check browser console for errors
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check network tab for failed requests

#### Debug Commands:
```bash
# Check build locally
npm run build

# Test API locally
npm run dev:backend

# Test frontend locally
npm run dev:frontend
```

### Performance Optimization

1. **Enable Edge Functions:**
   - Add `export const config = { runtime: 'edge' }` to API routes

2. **Optimize Images:**
   - Use Next.js Image component
   - Configure image domains in next.config.js

3. **Enable Caching:**
   - Add cache headers to API responses
   - Use Vercel's edge caching

### Monitoring

1. **Vercel Analytics:**
   - Enable in project settings
   - Monitor performance and usage

2. **Error Tracking:**
   - Add Sentry or similar service
   - Monitor API errors and frontend crashes

3. **Database Monitoring:**
   - Use MongoDB Atlas monitoring
   - Set up alerts for performance issues

## 🎉 Your AI Component Generator is now live!

Visit your deployed application and start building amazing React components with AI assistance.