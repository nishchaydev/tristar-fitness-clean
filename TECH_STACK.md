# 🛠️ TriStar Fitness - Complete Tech Stack

## 📱 **Frontend Architecture**

### **Core Framework**
- **React 19.1.1** - Modern UI library with hooks and functional components
- **TypeScript 5.5.3** - Type safety and better developer experience
- **Vite 7.1.3** - Lightning-fast build tool and dev server

### **Routing & Navigation**
- **React Router DOM 6.26.2** - Client-side routing
- **HashRouter** - GitHub Pages compatible routing

### **State Management**
- **Zustand 4.5.0** - Lightweight state management
- **React Hook Form 7.53.0** - Form state and validation
- **TanStack Query 5.56.2** - Server state management

## 🎨 **UI & Styling**

### **CSS Framework**
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefix automation

### **Component Libraries**
- **Radix UI** - 40+ headless UI components
- **Shadcn/ui** - Pre-built component system
- **Lucide React** - Beautiful icon library

### **Animations**
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS Animate** - CSS animations

## 📊 **Data & Analytics**

### **Charts & Visualization**
- **Recharts** - React charting library
- **Custom Analytics Dashboard** - Member/visitor metrics

### **Date Handling**
- **Date-fns** - Modern date utility library

## 📄 **Document Generation**

### **PDF Features**
- **jsPDF 3.0.2** - PDF generation
- **jsPDF AutoTable** - Table generation in PDFs
- **HTML2Canvas** - Screenshot generation
- **JSZip** - File compression

### **Export Features**
- **CSV Export** - Member data export
- **PDF Invoices** - Professional invoice generation

## 📱 **QR Code System**

### **QR Code Features**
- **QRCode 1.5.4** - QR code generation
- **QR Scanner 1.4.2** - QR code scanning
- **Visitor Registration** - QR-based visitor check-in

## 🗄️ **Backend & Database**

### **Backend Services**
- **Supabase 2.50.3** - Backend-as-a-Service
- **Node.js** - Backend runtime
- **Express.js** - Web framework (in backend folder)

### **Data Storage**
- **Local Storage** - Client-side data persistence
- **Demo Data System** - In-memory data for development

## 🔧 **Development Tools**

### **Build & Bundling**
- **Vite** - Build tool and dev server
- **ESLint** - Code linting and formatting
- **TypeScript** - Type checking

### **Deployment**
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - CI/CD automation
- **Custom Deploy Script** - Automated deployment

## 📁 **File Structure**

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── shared/         # Custom shared components
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── auth.ts         # Authentication logic
│   ├── dataSync.ts     # Data management
│   ├── pdfGenerator.ts # PDF generation
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Members.tsx     # Member management
│   ├── Visitors.tsx    # Visitor management
│   ├── Invoices.tsx    # Invoice management
│   └── LandingPage.tsx # Public landing page
└── App.tsx             # Main app component

backend/
├── server.js           # Express server
├── routes/             # API routes
└── config/             # Configuration files

scripts/
├── deploy.js           # Deployment automation
└── deploy.bat          # Windows deployment script
```

## 🚀 **Key Features**

### **Member Management**
- Member registration and profiles
- Membership tracking
- Payment history
- Follow-up system

### **Visitor System**
- QR code registration
- Visitor analytics
- Follow-up management
- Member conversion tracking

### **Invoice System**
- Professional PDF invoices
- Payment tracking
- Export functionality

### **Analytics Dashboard**
- Member statistics
- Revenue tracking
- Visitor metrics
- Activity logs

## 📱 **Mobile Responsiveness**

### **Responsive Design**
- **Mobile-first** approach
- **Tailwind breakpoints**: sm, md, lg, xl
- **Touch-friendly** buttons and interactions
- **Hamburger menu** for mobile navigation

### **Mobile Optimizations**
- Smaller text sizes on mobile
- Compact button layouts
- Responsive grid systems
- Touch-optimized spacing

## 🎨 **Theme System**

### **Light Theme Only**
- **Forced light theme** - No dark mode
- **System preference ignored** - Always light
- **Clean, professional** appearance
- **Consistent branding** across devices

## 🔐 **Authentication**

### **User Management**
- **Role-based access** (Owner, Staff)
- **Demo accounts** for testing
- **Protected routes** with authentication
- **Session management**

## 📊 **Performance**

### **Optimizations**
- **Code splitting** with Vite
- **Tree shaking** for smaller bundles
- **Lazy loading** for better performance
- **Optimized images** and assets

## 🛠️ **Development Commands**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run git          # Full deployment automation
```

## 🌐 **Deployment**

### **GitHub Pages**
- **Automatic deployment** on push
- **GitHub Actions** CI/CD
- **Custom domain** support
- **HTTPS** enabled

### **Deployment Process**
1. Code changes committed
2. GitHub Actions triggered
3. Build process runs
4. Deploy to GitHub Pages
5. Live site updated

---

**Last Updated**: September 2025  
**Version**: 2.0.0  
**Live URL**: https://nishchaydev.github.io/tristar-fitness-clean/
