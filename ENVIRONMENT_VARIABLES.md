# Environment Variables for Vercel Deployment

## 🔧 **Required Environment Variables**

Add these to your Vercel project settings:

### **Database Configuration**
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
```

### **Server Configuration**
```
PORT=3000
NODE_ENV=production
```

### **Email Configuration (for Admin Authentication)**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **Google Gemini AI Configuration**
```
GEMINI_API_KEY=your-gemini-api-key
```

### **Cloudinary Configuration (for image uploads)**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **Logging Configuration**
```
LOG_LEVEL=ERROR
```

## 🚀 **How to Set Environment Variables in Vercel**

### **Step 1: Go to Vercel Dashboard**
1. Open [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** tab

### **Step 2: Add Environment Variables**
1. Click on **Environment Variables** section
2. Add each variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production, Preview, Development
3. Repeat for all variables above

### **Step 3: Redeploy**
1. Go to **Deployments** tab
2. Click **Redeploy** on your latest deployment

## 🔍 **Testing Your Environment Variables**

After deployment, test your API endpoints:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test Gemini
curl https://your-app.vercel.app/api/gemini/test
```

## ⚠️ **Important Notes**

1. **MongoDB Atlas**: Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
2. **Gmail App Password**: Use App Password, not regular password for EMAIL_PASS
3. **Cloudinary**: Ensure your Cloudinary account is active
4. **Gemini API**: Make sure your API key has proper permissions

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors**: Check that your frontend URL is in the CORS origins
2. **Database Connection**: Verify MONGODB_URI is correct
3. **Email Not Working**: Check EMAIL_USER and EMAIL_PASS
4. **Image Upload Fails**: Verify Cloudinary credentials

### **Debug Commands:**
```bash
# Check environment variables
curl https://your-app.vercel.app/api/health

# Test database connection
curl https://your-app.vercel.app/api/images

# Test email service
curl -X POST https://your-app.vercel.app/api/admin/request-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
