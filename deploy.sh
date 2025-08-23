#!/bin/bash

# 🚀 Vercel Deployment Script
# This script helps you deploy your application to Vercel

echo "🚀 Starting Vercel Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please initialize git first:"
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Auto-commit before deployment"
fi

# Check if we have a remote repository
if ! git remote get-url origin &> /dev/null; then
    print_error "No remote repository found. Please add a remote:"
    echo "git remote add origin <your-github-repo-url>"
    exit 1
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    print_success "Code pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

# Check if vercel is logged in
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in:"
    vercel login
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    echo ""
    echo "🎉 Your application is now live!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to your Vercel dashboard"
    echo "2. Add environment variables (see ENVIRONMENT_VARIABLES.md)"
    echo "3. Test your application"
    echo "4. Update CORS origins if needed"
    echo ""
    echo "📚 Documentation:"
    echo "- Deployment Guide: VERCEL_DEPLOYMENT_GUIDE.md"
    echo "- Environment Variables: ENVIRONMENT_VARIABLES.md"
    echo "- Troubleshooting: Check the guides above"
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi
