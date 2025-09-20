#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting TriStar Fitness Deployment...\n');

try {
  // Step 1: Check if we're in a git repository
  console.log('📋 Checking git status...');
  execSync('git status --porcelain', { stdio: 'pipe' });
  
  // Step 2: Add all changes
  console.log('📦 Adding all changes to git...');
  execSync('git add .', { stdio: 'inherit' });
  
  // Step 3: Check if there are changes to commit
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (!status.trim()) {
    console.log('✅ No changes to commit. Repository is up to date.');
    process.exit(0);
  }
  
  // Step 4: Create commit with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const commitMessage = `feat: Auto-deploy ${timestamp}`;
  
  console.log('💾 Committing changes...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  // Step 5: Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 6: Deploy to GitHub Pages
  console.log('🌐 Deploying to GitHub Pages...');
  execSync('npm run deploy', { stdio: 'inherit' });
  
  // Step 7: Push to main branch
  console.log('⬆️ Pushing to main branch...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('📱 Your app should be live at: https://nishchaydev.github.io/tristar-fitness-clean/');
  console.log('⏱️ Changes may take 1-2 minutes to appear on GitHub Pages.');
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.error('\n🔧 Troubleshooting:');
  console.error('1. Make sure you have git configured');
  console.error('2. Check your internet connection');
  console.error('3. Verify GitHub repository access');
  console.error('4. Run "npm install" if dependencies are missing');
  process.exit(1);
}
