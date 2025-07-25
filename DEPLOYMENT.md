# Render Deployment Guide

## 🚀 Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2: Deploy Main Application
1. Click "New +" → "Web Service"
2. Connect your GitHub repo: `lindaassefa/Health-connect`
3. Configure:
   - **Name**: `med-mingle`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `med-mingle-db`
   - **Database**: `medmingle`
   - **User**: `medmingle_user`
   - **Plan**: Free

### Step 4: Set Environment Variables
In your web service, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate a random string>
OPENAI_API_KEY=<your OpenAI API key>
AI_MODERATION_URL=https://ai-moderation-service.onrender.com
```

### Step 5: Deploy AI Moderation Service (Optional)
If you want the full AI moderation:

1. Create a new repository for the AI service
2. Upload the `ai-moderation-env/service/` folder
3. Deploy as a separate Python service on Render
4. Update the `AI_MODERATION_URL` in your main service

### Step 6: Initialize Database
After deployment, initialize the database tables:
1. Go to your Render dashboard
2. Open the web service shell
3. Run: `npm run init-db`
4. Check logs for "Database initialization completed successfully!"

### Step 7: Test Your Deployment
- Visit your Render URL
- Test registration/login
- Test content moderation

## 🔧 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database is created and running
- Check logs in Render dashboard

### Database Table Issues
If you see "relation 'Users' does not exist" errors:

**Option 1: Web Interface (No Shell Required)**
1. Visit: `https://your-app-name.onrender.com/db-init`
2. Click "Initialize Database" button
3. Wait for completion and check status

**Option 2: API Endpoint**
```bash
curl -X POST https://your-app-name.onrender.com/api/db-init
```

**Option 3: Shell Access (Paid Plan Required)**
```bash
npm run fix-db
```

**Option 4: Automatic Fix**
The app will now automatically create tables on startup - just restart your service.

**Check Logs**: Look for "Database synced successfully" in logs

### Build Issues
- Check Node.js version (22.x)
- Ensure all dependencies are in `package.json`
- Check build logs for errors

### AI Moderation Issues
- If AI service is down, fallback moderation will work
- Check AI service logs
- Verify `AI_MODERATION_URL` is correct

## 📝 Notes

- **Free Tier Limits**: 
  - 750 hours/month for web services
  - 90 days for PostgreSQL
  - 1GB storage for PostgreSQL

- **Environment Variables**: All sensitive data should be in environment variables
- **Logs**: Check Render dashboard for detailed logs
- **Custom Domain**: Can be added in Render dashboard

## 🎯 Success Indicators

✅ Application loads without errors
✅ User registration works
✅ User login works  
✅ Content moderation works (basic or AI)
✅ Database operations work
✅ No console errors in browser 

## Summary of Database Fix

I've identified and fixed the database table creation issue that was causing the "relation 'Users' does not exist" error. Here's what I've implemented:

### 🛠️ **Root Cause**
The application was trying to access database tables that didn't exist because the Sequelize sync process was failing during startup.

### 🛠️ **Fixes Applied**

1. **Enhanced Server Initialization** (`src/server.js`):
   - Improved database initialization with better error handling
   - Added proper model imports to ensure all tables are created
   - Enhanced the middleware to check if tables exist before trying to use them

2. **Database Initialization Script** (`init-db.js`):
   - Created a comprehensive script to initialize the database
   - Includes table creation, verification, and testing
   - Added to package.json as `npm run init-db`

3. **Quick Fix Script** (`fix-database.js`):
   - Created an immediate fix script for Render deployments
   - Tests connection, creates tables, verifies functionality
   - Added to package.json as `npm run fix-db`

4. **Updated Documentation** (`DEPLOYMENT.md`):
   - Added troubleshooting section for database issues
   - Included step-by-step instructions for fixing the problem
   - Added database initialization step to deployment process

### 🚀 **How to Fix Your Current Issue**

**Option 1: Quick Fix (Recommended)**
```bash
npm run fix-db
```

**Option 2: Manual Initialization**
```bash
npm run init-db
```

**Option 3: Automatic Fix**
The app will now automatically create tables on startup, so you can simply restart your Render service.

### 📋 **What the Fix Does**

1. **Connects to your PostgreSQL database**
2. **Creates all missing tables** (Users, Posts, Likes, Follows, Comments, Products)
3. **Verifies table creation** by checking if they exist
4. **Tests basic functionality** by creating and deleting a test user
5. **Provides clear feedback** on what was fixed

### 📋 **Expected Results**

After running the fix:
- ✅ Database tables will be created
- ✅ User registration will work
- ✅ User login will work
- ✅ All database operations will function properly
- ✅ No more "relation 'Users' does not exist" errors

The fix is designed to be safe and won't delete any existing data. It will only create missing tables and ensure the database schema is properly set up. 