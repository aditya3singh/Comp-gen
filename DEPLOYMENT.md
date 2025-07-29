# 🚀 Deployment Guide - AI Component Generator Platform

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key (optional - has fallback)
- Vercel account (for frontend)
- Railway/Render account (for backend)

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/componentgen
JWT_SECRET=your-super-secure-jwt-secret-here
PORT=5001

# AI Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
ENABLE_AI_FALLBACK=true

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### Frontend Environment Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
NODE_ENV=production
```

## 🌐 Deployment Steps

### 1. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get the connection string
5. Update `MONGO_URI` in backend environment

### 2. Backend Deployment (Railway)

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and initialize
   railway login
   railway init
   ```

2. **Configure Environment Variables**
   - Go to Railway dashboard
   - Add all backend environment variables
   - Ensure `PORT` is set to Railway's provided port

3. **Deploy**
   ```bash
   railway up
   ```

### 3. Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from frontend directory
   cd frontend
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add `NEXT_PUBLIC_API_URL` pointing to your Railway backend
   - Redeploy if needed

### 4. Domain Configuration

1. **Backend Domain**
   - Railway provides: `https://your-app.railway.app`
   - Update `NEXT_PUBLIC_API_URL` in Vercel

2. **Frontend Domain**
   - Vercel provides: `https://your-app.vercel.app`
   - Update `FRONTEND_URL` in Railway

## 🧪 Testing Deployment

### Health Check Endpoints
```bash
# Backend health check
curl https://your-backend.railway.app/api/health

# Frontend accessibility
curl https://your-frontend.vercel.app
```

### Feature Testing Checklist
- [ ] User registration and login
- [ ] Session creation and management
- [ ] AI component generation (with fallback)
- [ ] Component preview and editing
- [ ] Interactive property editor
- [ ] Code export functionality
- [ ] Session persistence across logins

## 🔍 Monitoring & Debugging

### Backend Logs
```bash
# Railway logs
railway logs

# Check specific service
railway logs --service backend
```

### Frontend Logs
```bash
# Vercel logs
vercel logs

# Real-time logs
vercel logs --follow
```

### Common Issues & Solutions

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is correctly set in backend
   - Check Vercel domain matches the CORS configuration

2. **Database Connection**
   - Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for Railway)
   - Check connection string format

3. **API Key Issues**
   - Verify OpenRouter API key is valid
   - Fallback mode should work without API key

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📊 Performance Optimization

### Backend Optimizations
- Enable gzip compression
- Implement Redis caching (optional)
- Database connection pooling
- API response caching

### Frontend Optimizations
- Next.js automatic optimizations
- Image optimization
- Bundle analysis and splitting
- CDN delivery via Vercel

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] JWT secrets are strong and unique
- [ ] Database access restricted
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting active

## 📈 Scaling Considerations

### Horizontal Scaling
- Railway auto-scaling for backend
- Vercel edge functions for frontend
- MongoDB Atlas auto-scaling

### Performance Monitoring
- Railway metrics dashboard
- Vercel analytics
- MongoDB Atlas monitoring

## 🚀 Go Live Checklist

- [ ] All environment variables configured
- [ ] Database connected and accessible
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] AI integration working (with fallback)
- [ ] All features tested in production
- [ ] Monitoring and logging configured
- [ ] Domain names configured (if custom)
- [ ] SSL certificates active

## 📞 Support & Troubleshooting

### Useful Commands
```bash
# Check backend status
curl https://your-backend.railway.app/api/health

# Test authentication
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test AI generation (with token)
curl -X POST https://your-backend.railway.app/api/ai/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a blue button","sessionId":"SESSION_ID"}'
```

### Platform-Specific Documentation
- [Railway Deployment Guide](https://docs.railway.app/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)

---

**🎉 Your AI Component Generator Platform is now live and ready for evaluation!**