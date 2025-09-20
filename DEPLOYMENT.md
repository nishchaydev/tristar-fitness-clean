# 🚀 TriStar Fitness - Deployment Guide

## Quick Deployment

### Option 1: Automated Script (Recommended)
```bash
npm run git-deploy
```

### Option 2: Windows Batch File
```bash
scripts/deploy.bat
```

### Option 3: Manual Steps
```bash
git add .
git commit -m "Your commit message"
npm run build
npm run deploy
git push origin main
```

## What the Deployment Script Does

1. **📋 Git Status Check** - Verifies repository state
2. **📦 Stage Changes** - Adds all modified files
3. **💾 Auto Commit** - Creates timestamped commit
4. **🔨 Build Project** - Runs `npm run build`
5. **🌐 Deploy to GitHub Pages** - Runs `npm run deploy`
6. **⬆️ Push to Main** - Pushes changes to GitHub

## Features Added

### 🎯 Visitor Management System
- **Follow-up System**: Convert visitors to follow-ups automatically
- **Member Conversion**: High-priority conversion tracking
- **Analytics Dashboard**: Visitor metrics and conversion rates
- **Purpose Tracking**: Trial, inquiry, tour categorization

### 📱 Mobile Responsiveness
- **Hamburger Menu**: Mobile navigation
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-Friendly**: Better button sizes and interactions

### 🧾 Invoice System
- **Real Address**: Updated to actual gym location
- **Professional Formatting**: Clean, modern invoice design
- **PDF Generation**: High-quality invoice exports

## Live App
🌐 **URL**: https://nishchaydev.github.io/tristar-fitness-clean/

## Troubleshooting

### Common Issues
1. **Build Fails**: Run `npm install` first
2. **Git Errors**: Check git configuration
3. **Deployment Fails**: Verify GitHub repository access
4. **Pages Not Updating**: Wait 1-2 minutes for GitHub Pages

### Manual Recovery
```bash
# If deployment script fails
git status
git add .
git commit -m "Manual fix"
npm run build
npm run deploy
git push origin main
```

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run git-deploy   # Full deployment automation
```

---
**Last Updated**: September 2025
**Version**: 2.0.0
