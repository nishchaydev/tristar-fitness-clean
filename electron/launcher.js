const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AppLauncher {
  constructor() {
    this.backendProcess = null;
    this.frontendProcess = null;
  }

  startBackend() {
    console.log('🚀 Starting TriStar Fitness Backend...');
    
    const backendPath = path.join(__dirname, '../backend');
    this.backendProcess = spawn('node', ['simple-server.js'], {
      cwd: backendPath,
      stdio: 'pipe'
    });

    this.backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    this.backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    this.backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });
  }

  startFrontend() {
    console.log('🚀 Starting TriStar Fitness Frontend...');
    
    this.frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    this.frontendProcess.stdout.on('data', (data) => {
      console.log(`Frontend: ${data}`);
    });

    this.frontendProcess.stderr.on('data', (data) => {
      console.error(`Frontend Error: ${data}`);
    });

    this.frontendProcess.on('close', (code) => {
      console.log(`Frontend process exited with code ${code}`);
    });
  }

  start() {
    console.log('🏋️‍♂️ TriStar Fitness - Starting Application...');
    
    // Start backend first
    this.startBackend();
    
    // Wait a moment for backend to start
    setTimeout(() => {
      this.startFrontend();
    }, 2000);

    // Handle app termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down TriStar Fitness...');
      this.cleanup();
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down TriStar Fitness...');
      this.cleanup();
    });
  }

  cleanup() {
    if (this.backendProcess) {
      this.backendProcess.kill();
    }
    if (this.frontendProcess) {
      this.frontendProcess.kill();
    }
    process.exit(0);
  }
}

// Start the launcher
const launcher = new AppLauncher();
launcher.start();
