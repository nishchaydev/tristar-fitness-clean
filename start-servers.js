#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('   TriStar Fitness - Starting Servers');
console.log('========================================');
console.log('');

// Function to start a process
function startProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  
  const process = spawn(command, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (err) => {
    console.error(`Failed to start ${name}:`, err);
  });

  return process;
}

// Start backend server
const backendPath = path.join(__dirname, 'backend');
const backendProcess = startProcess('npm', ['start'], backendPath, 'Backend Server');

// Wait a bit for backend to start
setTimeout(() => {
  console.log('Starting Frontend Server...');
  
  // Start frontend server
  const frontendProcess = startProcess('npm', ['run', 'dev'], __dirname, 'Frontend Server');
  
  console.log('');
  console.log('========================================');
  console.log('   Both servers are starting up!');
  console.log('========================================');
  console.log('');
  console.log('Backend:  http://localhost:6868');
  console.log('Frontend: http://localhost:3000');
  console.log('');
  console.log('Press Ctrl+C to stop both servers');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
  
}, 3000);




