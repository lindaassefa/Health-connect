# 🗄️ Database Setup Guide for Med Mingle

## Quick Setup Options

### Option 1: Supabase (Recommended - Free)
1. **Go to [Supabase](https://supabase.com)**
2. **Sign up/Login** with GitHub
3. **Create New Project**
   - Choose organization
   - Enter project name: `med-mingle`
   - Enter database password (save this!)
   - Choose region closest to you
4. **Wait for setup** (2-3 minutes)
5. **Get Connection String**
   - Go to Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option 2: Railway (Easy Setup)
1. **Go to [Railway](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Create New Project**
4. **Add PostgreSQL Service**
5. **Get Connection String**
   - Go to Variables tab
   - Copy the `DATABASE_URL`

### Option 3: Vercel Postgres (Integrated)
1. **Go to your [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your med-mingle project**
3. **Go to Storage tab**
4. **Create new Postgres database**
5. **Copy the connection string**

## 🔧 Setting Up Environment Variables

Once you have your database connection string, run these commands:

```bash
# Add database URL
vercel env add DATABASE_URL production

# Add OpenAI API key (get from https://platform.openai.com)
vercel env add OPENAI_API_KEY production
```

## 📊 Database Schema

The application will automatically create these tables:
- `Users` - User profiles and authentication
- `Posts` - Social media posts
- `Likes` - Post likes
- `Follows` - User relationships
- `Products` - Wellness products
- `Events` - Health events

## 🚀 Deploy to Production

After setting up the database and environment variables:

```bash
vercel --prod
```

## 🔍 Verify Setup

1. **Check your deployed app**: https://med-mingle.vercel.app
2. **Try to register a new user**
3. **Check if database tables are created**

## 🆘 Troubleshooting

### Database Connection Issues
- Verify your connection string format
- Check if database is accessible from Vercel
- Ensure database password is correct

### Environment Variables
- Run `vercel env ls` to see all variables
- Make sure variables are set for `production` environment

### Deployment Issues
- Check build logs: `vercel logs`
- Verify all environment variables are set
- Check database connectivity

## 📞 Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify database connection
3. Ensure all environment variables are set correctly 