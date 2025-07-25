#!/bin/bash

echo "🚀 Med Mingle Deployment Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.x or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18.x or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd health-engagement-frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi

cd ..

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Deployment Options:"
echo "1. Vercel (Recommended) - Full-stack deployment"
echo "2. Heroku + Netlify - Separate backend/frontend"
echo "3. Railway - Easy full-stack deployment"
echo ""
echo "🔧 Next Steps:"
echo "1. Set up your database (PostgreSQL)"
echo "2. Configure environment variables"
echo "3. Choose your deployment platform"
echo ""
echo "📖 See README.md for detailed deployment instructions" 