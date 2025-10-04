# TriStar Fitness - Client Installation Guide

## 🚀 Quick Installation (Recommended)

### For the Client:
1. **Download the installer**: `TriStar-Fitness-Installer.bat`
2. **Double-click** the installer file
3. **Follow the on-screen instructions**
4. **Done!** The app will be installed and ready to use

---

## 📋 What the Installer Does

✅ **Automatically:**
- Checks system requirements (Node.js, Git)
- Downloads latest version from GitHub
- Installs all dependencies
- Builds the application
- Creates desktop shortcuts
- Sets up Start Menu entries
- Creates uninstaller

✅ **Creates:**
- Desktop shortcut: "Start TriStar Fitness"
- Start Menu folder: "TriStar Fitness"
- Installation location: `C:\TriStarFitness\tristar-fitness-clean`

---

## 🔑 Login Credentials

### Owner Account:
- **Username:** `nikhil@tristar`
- **Password:** `nikhilverma@tristar`

### Manager Account:
- **Username:** `manager@tristar`
- **Password:** `manager@tristarfitness`

---

## 🚀 How to Start the Application

### Method 1: Desktop Shortcut
- Double-click **"Start TriStar Fitness"** on desktop

### Method 2: Start Menu
- Click **Start Menu** → **TriStar Fitness** → **Start TriStar Fitness**

---

## 🗑️ How to Uninstall

1. Go to **Start Menu** → **TriStar Fitness** → **Uninstall TriStar Fitness**
2. Follow the prompts
3. All files will be removed

---

## 🔧 Manual Installation (If Needed)

If the automatic installer fails:

1. **Install Prerequisites:**
   - Node.js: https://nodejs.org/ (Download LTS version)
   - Git: https://git-scm.com/

2. **Download & Install:**
   ```bash
   git clone https://github.com/nishchaydev/tristar-fitness-clean.git
   cd tristar-fitness-clean
   npm install
   cd backend && npm install && cd ..
   npm run build
   ```

3. **Start the Application:**
   ```bash
   npm run electron:dev
   ```

---

## 📞 Support

If you encounter any issues:
1. Check that Node.js and Git are installed
2. Ensure you have internet connection
3. Try the manual installation steps above

---

## 🎯 Features Included

✅ Complete gym management system
✅ Member check-in system
✅ Invoice generation
✅ Analytics dashboard
✅ Follow-up management
✅ Data export (PDF, Excel)
✅ Offline capabilities
✅ Professional UI with dark/light themes

---

**Installation Time:** ~5-10 minutes (depending on internet speed)
**System Requirements:** Windows 10/11, Node.js, Git, Internet connection
