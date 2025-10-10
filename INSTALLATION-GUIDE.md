# TriStar Fitness - Complete Installation Guide

## 🎯 Overview
This guide will walk you through setting up the TriStar Fitness management system step by step. The system includes a React frontend and Node.js backend with SQLite database.

## 📋 Prerequisites

### Required Software
1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Verify npm: `npm --version`

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/nishchaydev/tristar-fitness-clean.git
cd tristar-fitness-clean
```

### Step 2: Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 3: Environment Setup

#### Create Environment Files
1. **Root Environment File** (`.env`):
```bash
# Copy the example file
cp env.example .env
```

2. **Backend Environment File**:
```bash
cd backend
cp env.example .env
cd ..
```

#### Configure Environment Variables
Edit the `.env` files with your settings:

**Root `.env`**:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=TriStar Fitness
```

**Backend `.env`**:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DB_PATH=./database/tristar_fitness.db
```

### Step 4: Database Setup

#### Initialize the Database
```bash
cd backend
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/tristar_fitness.db');
console.log('Database initialized successfully');
db.close();
"
cd ..
```

### Step 5: Start the Application

#### Option A: Development Mode (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

#### Option B: Production Mode

**Build the Frontend:**
```bash
npm run build
```

**Start Both Servers:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (served from build)
npx serve -s dist -l 3000
```

### Step 6: Access the Application

1. Open your browser
2. Navigate to: `http://localhost:3000`
3. Default login credentials:
   - **Owner**: `admin@tristar.com` / `admin123`
   - **Manager**: `manager@tristar.com` / `manager123`

## 🔧 Configuration

### User Roles
- **Owner**: Full access to all features including Analytics
- **Manager**: Access to most features except Analytics

### Default Settings
- **Gym Name**: TriStar Fitness
- **Membership Types**: Basic, Premium, VIP
- **Invoice Numbering**: #MP0001, #MP0002, etc.

## 📁 Project Structure

```
tristar-fitness-clean/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Application pages
│   ├── contexts/          # React contexts
│   └── lib/               # Utilities and API
├── backend/               # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Authentication & validation
│   └── database/          # SQLite database files
├── public/                # Static assets
└── dist/                  # Built frontend (after build)
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001
npx kill-port 3001
```

#### 2. Database Connection Issues
```bash
# Check if database file exists
ls backend/database/

# Recreate database
rm backend/database/tristar_fitness.db
# Restart backend server
```

#### 3. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### 4. Build Issues
```bash
# Clear build cache
rm -rf dist
npm run build
```

### Logs and Debugging

#### Backend Logs
```bash
# Check backend logs
tail -f backend/logs/combined.log

# Check error logs
tail -f backend/logs/error.log
```

#### Frontend Console
- Open browser Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for API calls

## 🔄 Data Management

### JSON Sync System
The application includes a JSON sync system for offline access:

1. **Auto-sync**: Data is automatically synced to JSON files
2. **Manual sync**: Use "Sync All Data" button in Owner Dashboard
3. **Offline export**: Print/Export buttons work with cached JSON data

### Backup Database
```bash
# Create backup
cp backend/database/tristar_fitness.db backup_$(date +%Y%m%d).db
```

## 🚀 Deployment

### Local Network Access
To access from other devices on your network:

1. Find your IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `VITE_API_URL` in `.env` to your IP: `http://YOUR_IP:3001`
3. Restart both servers

### Production Deployment
1. Build the frontend: `npm run build`
2. Set up a web server (nginx, Apache)
3. Configure environment variables for production
4. Set up SSL certificates for HTTPS

## 📞 Support

### Getting Help
1. Check the logs in `backend/logs/`
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that ports 3000 and 3001 are available

### Key Features
- ✅ Member Management
- ✅ Invoice Generation & Management
- ✅ Check-in System
- ✅ Follow-up Management
- ✅ Analytics Dashboard
- ✅ Role-based Access Control
- ✅ Offline Data Export
- ✅ JSON Sync System

## 🎉 You're All Set!

Once everything is running:
1. Login with default credentials
2. Add your first member
3. Generate an invoice
4. Test the check-in system
5. Explore the analytics dashboard

The system is now ready for use! 🚀
