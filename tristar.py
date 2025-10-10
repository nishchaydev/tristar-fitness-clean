import subprocess
import os
import sys
import webbrowser
import time
from time import sleep
from urllib.request import urlopen
from urllib.error import URLError
import threading
import signal

class TriStarApp:
    def __init__(self):
        self.project_dir = os.path.dirname(os.path.abspath(__file__))
        self.backend_dir = os.path.join(self.project_dir, 'backend')
        self.frontend_process = None
        self.backend_process = None
        signal.signal(signal.SIGINT, self.signal_handler)

    def signal_handler(self, signum, frame):
        self.cleanup()
        sys.exit(0)

    def run_command(self, command, cwd=None, check_output=False):
        """Run a command and return the process object or output"""
        if check_output:
            try:
                return subprocess.check_output(command, cwd=cwd, shell=True, stderr=subprocess.STDOUT).decode()
            except subprocess.CalledProcessError as e:
                print(f"Error running command: {e.output.decode()}")
                return None

        if sys.platform == "win32":
            process = subprocess.Popen(
                f"cmd.exe /c {command}",
                cwd=cwd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            process = subprocess.Popen(
                command,
                cwd=cwd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True
            )

        def log_output(pipe, prefix):
            try:
                for line in pipe:
                    print(f"{prefix}: {line.strip()}")
            except: pass

        threading.Thread(target=log_output, args=(process.stdout, "OUT"), daemon=True).start()
        threading.Thread(target=log_output, args=(process.stderr, "ERR"), daemon=True).start()

        return process

    def check_dependencies(self):
        """Check and verify all required dependencies"""
        try:
            npm_version = self.run_command('npm --version', check_output=True)
            if not npm_version:
                print("❌ npm is not installed. Please install Node.js from https://nodejs.org/")
                return False
            print(f"✓ npm version {npm_version.strip()} found")
            
            node_version = self.run_command('node --version', check_output=True)
            print(f"✓ Node.js version {node_version.strip()} found")
            
            return True
        except Exception as e:
            print(f"❌ Error checking dependencies: {e}")
            return False

    def ensure_directories(self):
        """Ensure all required directories exist"""
        dirs = [
            os.path.join(self.backend_dir, 'data'),
            os.path.join(self.backend_dir, 'logs'),
            os.path.join(self.backend_dir, 'exports')
        ]
        for d in dirs:
            if not os.path.exists(d):
                os.makedirs(d)
                print(f"✓ Created directory: {d}")

    def install_dependencies(self, cwd, packages=""):
        """Install npm packages and handle errors"""
        try:
            command = 'npm install'
            if packages:
                command = f'npm install {packages}'
                
            print(f"Running: {command}")
            result = self.run_command(command, cwd=cwd, check_output=True)
            if result is not None:
                print("✓ Installation successful")
                return True
            return False
        except Exception as e:
            print(f"❌ Error installing packages: {e}")
            return False

    def wait_for_server(self, url, timeout=30):
        """Wait for a server to become available"""
        print(f"Waiting for server at {url}...")
        start_time = time.time()
        dots = 0
        while time.time() - start_time < timeout:
            try:
                urlopen(url)
                print(f"\n✓ Server running at {url}")
                return True
            except URLError:
                sleep(1)
                dots = (dots + 1) % 4
                print("." * dots + " " * (3-dots), end="\r", flush=True)
        print(f"\n❌ Server at {url} failed to start within {timeout} seconds")
        return False

    def start_backend(self):
        """Start the backend server"""
        print("\n1. Installing backend dependencies...")
        backend_packages = [
            'express',
            'cors',
            'dotenv',
            'sqlite3',
            'compression',
            'morgan',
            'archiver',
            'exceljs',
            'body-parser',
            'jsonwebtoken',
            'bcryptjs',
            'swagger-ui-express'
        ]
        
        # First check if node_modules exists and package.json is up to date
        if os.path.exists(os.path.join(self.backend_dir, 'node_modules')):
            print("Backend node_modules exists, running npm install to ensure dependencies...")
        
        if not self.install_dependencies(self.backend_dir, ' '.join(backend_packages)):
            print("❌ Failed to install backend dependencies")
            return False

        print("\n2. Starting Backend Server...")
        self.backend_process = self.run_command('node server.js', cwd=self.backend_dir)
        
        # Wait for server with health check
        return self.wait_for_server('http://localhost:6868/health', timeout=15)

    def start_frontend(self):
        """Start the frontend server"""
        print("\n3. Installing frontend dependencies...")
        if os.path.exists(os.path.join(self.project_dir, 'node_modules')):
            print("Frontend node_modules exists, running npm install to ensure dependencies...")
            
        if not self.install_dependencies(self.project_dir):
            print("❌ Failed to install frontend dependencies")
            return False

        print("\n4. Starting Frontend Development Server...")
        self.frontend_process = self.run_command('npm run dev', cwd=self.project_dir)
        return self.wait_for_server('http://localhost:5173', timeout=30)

    def cleanup(self):
        """Clean up processes on exit"""
        print("\n👋 Shutting down servers...")
        try:
            if self.backend_process:
                if sys.platform == "win32":
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.backend_process.pid)], 
                                check=True, capture_output=True)
                else:
                    self.backend_process.terminate()
                    self.backend_process.wait(timeout=5)
            
            if self.frontend_process:
                if sys.platform == "win32":
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.frontend_process.pid)],
                                check=True, capture_output=True)
                else:
                    self.frontend_process.terminate()
                    self.frontend_process.wait(timeout=5)
            
            print("✅ Servers stopped successfully!")
        except Exception as e:
            print(f"Error during cleanup: {e}")

    def run(self):
        """Run the application"""
        print("🚀 Starting TriStar Fitness Application...\n")
        
        if not self.check_dependencies():
            input("Press Enter to exit...")
            return

        self.ensure_directories()
        
        try:
            print("\n2. Starting Backend Server...")
            self.backend_process = self.run_command('node server.js', cwd=self.backend_dir)
            
            # Check generic URL first
            if not self.wait_for_server('http://localhost:6868/api', timeout=15):
                print("❌ Failed to start backend server")
                self.cleanup()
                return
            
            print("✓ Backend server started successfully")

            print("\n4. Starting Frontend Development Server...")
            self.frontend_process = self.run_command('npm run dev', cwd=self.project_dir)
            
            # Vite might take longer and use a different port initially
            print("\nWaiting for frontend server to start...")
            sleep(5)  # Give time for initial startup

            print("\n🌐 Opening application in your default browser...")
            webbrowser.open('http://localhost:3000')

            print("""
✨ TriStar Fitness is running!
   
   Frontend: http://localhost:3000
   Backend: http://localhost:6868
   
   Press Ctrl+C to stop the servers.
   
⚠️ Note: Do not close this window while using the application.
""")
            # Keep the script running and monitor processes
            while True:
                if self.backend_process.poll() is not None:
                    print("❌ Backend server stopped unexpectedly!")
                    break
                if self.frontend_process.poll() is not None:
                    print("❌ Frontend server stopped unexpectedly!")
                    break
                sleep(1)
                
            self.cleanup()
            
        except KeyboardInterrupt:
            self.cleanup()
        except Exception as e:
            print(f"\n❌ Error: {e}")
            self.cleanup()
        finally:
            input("\nPress Enter to exit...")

def main():
    app = TriStarApp()
    app.run()

if __name__ == "__main__":
    main()