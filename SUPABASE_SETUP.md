# 🆓 Free Supabase Database Setup

## 🚀 Quick Start (5 minutes)

### Step 1: Create Supabase Account
1. **Go to**: https://supabase.com
2. **Click "Start your project"**
3. **Sign up with GitHub** (recommended)

### Step 2: Create New Project
1. **Click "New Project"**
2. **Choose Organization** (create new if needed)
3. **Project Details**:
   - **Name**: `med-mingle`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (US East, US West, etc.)
4. **Click "Create new project"**
5. **Wait 2-3 minutes** for setup

### Step 3: Get Connection String
1. **Go to Settings** (gear icon in sidebar)
2. **Click "Database"**
3. **Copy "Connection string"** (URI format)
4. **It looks like**: `postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres`

### Step 4: Add to Vercel
```bash
# Add your database URL
vercel env add DATABASE_URL production

# Add OpenAI API key (get from https://platform.openai.com)
vercel env add OPENAI_API_KEY production

# Deploy to production
vercel --prod
```

## 🎯 What You Get (FREE)

- ✅ **500MB database** (plenty for Med Mingle)
- ✅ **50,000 monthly active users**
- ✅ **Real-time subscriptions**
- ✅ **Built-in authentication**
- ✅ **Auto-generated APIs**
- ✅ **PostgreSQL compatible**

## 🔧 Database Schema

Your app will automatically create these tables:
- `Users` - User profiles and authentication
- `Posts` - Social media posts
- `Likes` - Post likes
- `Follows` - User relationships
- `Products` - Wellness products
- `Events` - Health events

## 🆘 Troubleshooting

### Connection Issues
- Verify your connection string format
- Check if database password is correct
- Ensure region is accessible

### Environment Variables
- Run `vercel env ls` to see all variables
- Make sure variables are set for `production` environment

### Deployment Issues
- Check build logs: `vercel logs`
- Verify all environment variables are set
- Check database connectivity

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard for database status
2. Verify connection string format
3. Check Vercel deployment logs
4. Ensure all environment variables are set correctly

## 🎉 Success!

After setup, your app will be available at:
- **Production**: https://med-mingle.vercel.app
- **Database Dashboard**: https://supabase.com/dashboard 