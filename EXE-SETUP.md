# 🏋️‍♂️ TriStar Fitness - Executable Setup Guide

## 📦 Creating the EXE File

### Quick Start (Windows)
1. **Run the build script:**
   ```bash
   build-exe.bat
   ```

2. **Find your EXE:**
   - Location: `dist-electron/win-unpacked/TriStar Fitness.exe`
   - Size: ~200MB (includes all dependencies)

### Manual Build Process
```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Build Electron executable
npm run electron:dist
```

## 🗄️ Database Features

### Automatic Database Setup
- **Database Location:**
  - Windows: `%USERPROFILE%/AppData/Local/TriStarFitness/data/tristar.db`
  - Mac/Linux: `~/.tristarfitness/data/tristar.db`

- **Auto-Creation:** Database and tables are created automatically on first run
- **No Configuration:** Zero setup required - just run the EXE!

### Database Tables
- **Members:** Name, phone, membership type, dates, status
- **Visitors:** Name, phone, date, purpose
- **Payments:** Member ID, amount, date, method
- **Invoices:** Member ID, amount, dates, status
- **Admins:** Username, password, role

### Default Admin Accounts
- **Admin:** `admin` / `admin123`
- **Manager:** `manager` / `manager123`

## 🔧 Database Management

### Built-in Settings Panel
1. Open the app
2. Go to **Settings** → **Database Management**
3. View database location
4. Export full database backup
5. Export individual CSV files

### Export Options
- **Full Database:** Complete `.db` file backup
- **CSV Exports:** Members, Visitors, Payments, Invoices
- **Automatic Downloads:** Files saved to Downloads folder

## 🚀 Deployment Options

### Option 1: Standalone EXE
- Single executable file
- Includes all dependencies
- No installation required
- Perfect for single-user setups

### Option 2: Web Application
- Deployed to GitHub Pages
- Access from any device
- Multi-user support
- Requires internet connection

## 📋 System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.14+, Linux
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 500MB for app + database
- **Network:** Optional (for web features)

### Recommended Setup
- **OS:** Windows 11 or macOS 12+
- **RAM:** 8GB+
- **Storage:** 1GB+ free space
- **Network:** Stable internet for updates

## 🛠️ Development Setup

### For Developers
```bash
# Clone repository
git clone https://github.com/nishchaydev/tristar-fitness-clean.git
cd tristar-fitness-clean

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start development servers
npm run start:all

# Build for production
npm run build
npm run electron:dist
```

### Project Structure
```
tristar-fitness-clean/
├── electron/           # Electron main process
│   ├── main.js        # Main Electron entry
│   ├── db.js          # SQLite database handler
│   └── preload.js     # Secure IPC bridge
├── src/               # React frontend
├── backend/           # Node.js backend
├── dist/              # Built frontend
└── dist-electron/     # Built Electron app
```

## 🔒 Security Features

### Data Protection
- **Local Storage:** All data stored locally
- **No Cloud Sync:** Data never leaves your computer
- **Encrypted Passwords:** Secure admin authentication
- **SQL Injection Protection:** Parameterized queries

### Access Control
- **Role-based Access:** Admin vs Manager permissions
- **Secure IPC:** Electron security best practices
- **No External Dependencies:** Self-contained application

## 📊 Features Overview

### Member Management
- Add/Edit/Delete members
- Membership tracking
- Expiry date monitoring
- Trainer assignments

### Visitor Tracking
- Visitor check-in/out
- Purpose tracking
- Follow-up management

### Financial Management
- Payment recording
- Invoice generation
- Revenue tracking
- Payment method tracking

### Analytics Dashboard
- Member statistics
- Revenue reports
- Attendance tracking
- Growth metrics

## 🆘 Troubleshooting

### Common Issues

**EXE won't start:**
- Check Windows Defender/Antivirus
- Run as Administrator
- Check system requirements

**Database errors:**
- Check file permissions
- Ensure sufficient disk space
- Restart the application

**Performance issues:**
- Close other applications
- Check available RAM
- Restart the application

### Support
- **GitHub Issues:** [Report bugs](https://github.com/nishchaydev/tristar-fitness-clean/issues)
- **Documentation:** [Full docs](https://github.com/nishchaydev/tristar-fitness-clean)
- **Email:** info@tristarfitness.com

## 🎯 Production Deployment

### For Gym Owners
1. **Download EXE:** Get the latest release
2. **Run Setup:** Double-click to start
3. **Configure:** Set up admin accounts
4. **Start Using:** Begin managing your gym!

### For IT Departments
1. **Deploy EXE:** Distribute to gym computers
2. **Configure Network:** Set up shared database (optional)
3. **Train Staff:** Provide user training
4. **Monitor Usage:** Track system performance

---

## 🏆 Success Metrics

- ✅ **Zero Setup Time:** Ready to use in seconds
- ✅ **Offline Capable:** Works without internet
- ✅ **Data Secure:** Local storage only
- ✅ **Professional UI:** Modern, intuitive design
- ✅ **Scalable:** Grows with your business

**TriStar Fitness - Professional Gym Management Made Simple!** 🏋️‍♂️

