@echo off
REM 🚀 Vercel Deployment Script for Windows
REM This script helps you deploy your application to Vercel

echo 🚀 Starting Vercel Deployment Process...

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vercel CLI is not installed. Installing now...
    npm install -g vercel
)

REM Check if we're in a git repository
if not exist ".git" (
    echo [ERROR] Not in a git repository. Please initialize git first:
    echo git init
    echo git add .
    echo git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check if we have uncommitted changes
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo [WARNING] You have uncommitted changes. Committing them now...
    git add .
    git commit -m "Auto-commit before deployment"
)

REM Check if we have a remote repository
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No remote repository found. Please add a remote:
    echo git remote add origin ^<your-github-repo-url^>
    pause
    exit /b 1
)

REM Push to GitHub
echo [INFO] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo [ERROR] Failed to push to GitHub. Please check your git configuration.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Code pushed to GitHub successfully!
)

REM Check if vercel is logged in
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Not logged in to Vercel. Please log in:
    vercel login
)

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
vercel --prod

if errorlevel 1 (
    echo [ERROR] Deployment failed. Please check the error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 Deployment completed successfully!
    echo.
    echo 📋 Next steps:
    echo 1. Go to your Vercel dashboard
    echo 2. Add environment variables (see ENVIRONMENT_VARIABLES.md)
    echo 3. Test your application
    echo 4. Update CORS origins if needed
    echo.
    echo 📚 Documentation:
    echo - Deployment Guide: VERCEL_DEPLOYMENT_GUIDE.md
    echo - Environment Variables: ENVIRONMENT_VARIABLES.md
    echo - Troubleshooting: Check the guides above
    echo.
    pause
)
