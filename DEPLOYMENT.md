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

### Step 6: Test Your Deployment
- Visit your Render URL
- Test registration/login
- Test content moderation

## 🔧 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database is created and running
- Check logs in Render dashboard

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