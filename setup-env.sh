#!/bin/bash

echo "🔧 Med Mingle Environment Setup"
echo "================================"

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo "✅ Generated JWT Secret: $JWT_SECRET"
echo ""

echo "📋 Required Environment Variables:"
echo "=================================="
echo "JWT_SECRET=$JWT_SECRET"
echo "DATABASE_URL=your_postgresql_connection_string"
echo "OPENAI_API_KEY=your_openai_api_key"
echo ""

echo "🌐 Database Options:"
echo "==================="
echo "1. Supabase (Free tier available)"
echo "   - Go to https://supabase.com"
echo "   - Create new project"
echo "   - Get connection string from Settings > Database"
echo ""
echo "2. Railway (Easy setup)"
echo "   - Go to https://railway.app"
echo "   - Create new project"
echo "   - Add PostgreSQL service"
echo "   - Get connection string from Variables tab"
echo ""
echo "3. Vercel Postgres (Integrated)"
echo "   - Go to your Vercel dashboard"
echo "   - Select your project"
echo "   - Go to Storage tab"
echo "   - Create new Postgres database"
echo ""

echo "🔑 Setting up Vercel Environment Variables..."
echo ""

# Set JWT secret
vercel env add JWT_SECRET <<< "$JWT_SECRET"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Set up your database (choose one of the options above)"
echo "2. Get your database connection string"
echo "3. Run: vercel env add DATABASE_URL"
echo "4. Get your OpenAI API key from https://platform.openai.com"
echo "5. Run: vercel env add OPENAI_API_KEY"
echo "6. Deploy to production: vercel --prod"
echo ""
echo "🎯 Quick Database Setup Commands:"
echo "================================="
echo "# For Supabase:"
echo "DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
echo ""
echo "# For Railway:"
echo "DATABASE_URL='postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]'"
echo ""
echo "🚀 After setting up database, run:"
echo "vercel --prod" 