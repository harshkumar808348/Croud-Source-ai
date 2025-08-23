# 🚀 Vercel Deployment Guide

## 📋 **Prerequisites**

Before deploying, make sure you have:

1. ✅ **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. ✅ **GitHub Account**: Your code should be in a GitHub repository
3. ✅ **MongoDB Atlas**: Database hosted on MongoDB Atlas
4. ✅ **Cloudinary Account**: For image uploads
5. ✅ **Google Gemini API Key**: For AI analysis
6. ✅ **Gmail App Password**: For email functionality

## 🛠️ **Project Structure**

Your project is now configured for Vercel deployment:

```
analysis/
├── frontend/          # React app
│   ├── vercel.json   # Frontend Vercel config
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js API
│   ├── vercel.json   # Backend Vercel config
│   └── package.json  # Backend dependencies
├── api/              # Vercel API handler
│   └── index.js      # API entry point
├── vercel.json       # Root Vercel config
└── README.md
```

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Verify Structure**:
   - All configuration files are in place
   - Environment variables are documented
   - No sensitive data in code

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard**

1. **Import Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"New Project"**
   - Import your GitHub repository

2. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: Leave empty (handled by vercel.json)
   - **Output Directory**: Leave empty (handled by vercel.json)

3. **Add Environment Variables**:
   - Click **"Environment Variables"**
   - Add all variables from `ENVIRONMENT_VARIABLES.md`
   - Set environment to **Production, Preview, Development**

4. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete

#### **Option B: Deploy via Vercel CLI**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow prompts**:
   - Link to existing project or create new
   - Set environment variables
   - Confirm deployment

### **Step 3: Configure Environment Variables**

Add these to your Vercel project settings:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=ERROR
```

### **Step 4: Update CORS Origins**

After deployment, update the CORS origins in `backend/index.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-actual-app-name.vercel.app']
    : 'http://localhost:5173',
  credentials: true
}));
```

## 🔍 **Testing Your Deployment**

### **1. Health Check**
```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### **2. Test Frontend**
- Visit your Vercel URL
- Check if React app loads
- Test navigation between pages

### **3. Test API Endpoints**
```bash
# Test Gemini
curl https://your-app.vercel.app/api/gemini/test

# Test image upload
curl -X POST https://your-app.vercel.app/api/upload \
  -F "image=@test-image.jpg" \
  -F "userName=Test User" \
  -F "userArea=Test Area" \
  -F "userPincode=123456" \
  -F "latitude=12.3456" \
  -F "longitude=78.9012"
```

### **4. Test Admin Authentication**
```bash
# Register admin
curl -X POST https://your-app.vercel.app/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'

# Request verification code
curl -X POST https://your-app.vercel.app/api/admin/request-code \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Failures**
- **Issue**: Frontend build fails
- **Solution**: Check `frontend/package.json` dependencies
- **Fix**: Run `npm install` locally first

#### **2. API 404 Errors**
- **Issue**: API routes return 404
- **Solution**: Check `vercel.json` routing configuration
- **Fix**: Ensure API routes point to correct handlers

#### **3. CORS Errors**
- **Issue**: Frontend can't access API
- **Solution**: Update CORS origins in backend
- **Fix**: Add your Vercel domain to allowed origins

#### **4. Database Connection Issues**
- **Issue**: MongoDB connection fails
- **Solution**: Check MONGODB_URI format
- **Fix**: Ensure MongoDB Atlas allows all IPs (0.0.0.0/0)

#### **5. Environment Variables Not Working**
- **Issue**: Variables undefined in production
- **Solution**: Check Vercel environment variables
- **Fix**: Redeploy after adding variables

### **Debug Commands**

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs your-app-name

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## 📊 **Performance Optimization**

### **Frontend Optimizations**
- ✅ Code splitting configured
- ✅ Terser minification enabled
- ✅ Source maps disabled for production
- ✅ Vendor chunks separated

### **Backend Optimizations**
- ✅ Serverless functions configured
- ✅ 30-second timeout for long operations
- ✅ Error handling middleware
- ✅ Health check endpoint

## 🔄 **Continuous Deployment**

### **Automatic Deployments**
- Every push to `main` branch triggers deployment
- Preview deployments for pull requests
- Automatic rollback on failures

### **Manual Deployments**
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## 📈 **Monitoring**

### **Vercel Analytics**
- View deployment performance
- Monitor API response times
- Track error rates
- Analyze user behavior

### **Custom Monitoring**
- Health check endpoint: `/api/health`
- Error logging in Vercel dashboard
- Performance metrics in Vercel analytics

## 🎉 **Success Checklist**

- ✅ Repository pushed to GitHub
- ✅ Vercel project created
- ✅ Environment variables configured
- ✅ CORS origins updated
- ✅ Health check passes
- ✅ Frontend loads correctly
- ✅ API endpoints respond
- ✅ Database connection works
- ✅ Email service functional
- ✅ Image upload working
- ✅ AI analysis operational

Your application is now deployed and ready for production! 🚀
