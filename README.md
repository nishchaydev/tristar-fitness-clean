# TriStar Fitness - Gym Management System

A modern, professional gym management system built with React 19, TypeScript, and Express.js. Designed for gym owners and trainers to manage members, track sessions, generate invoices, and monitor business performance.

![TriStar Fitness Dashboard](https://via.placeholder.com/800x400/10B981/FFFFFF?text=TriStar+Fitness+Dashboard)

## 🚀 Features

### Core Functionality
- **Member Management** - Add, edit, and track member information
- **Trainer Management** - Manage trainer schedules and specializations
- **Visitor Tracking** - Check-in/check-out system for visitors
- **Invoice Generation** - Professional PDF invoice creation
- **Session Management** - Track training sessions and schedules
- **Follow-up System** - Automated reminders for expiring memberships
- **Activity Logging** - Comprehensive audit trail
- **Data Export/Import** - Backup and restore functionality

### Professional Features
- **Dark/Light Theme** - Toggle between themes with system preference detection
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Role-based Access** - Owner and Trainer permissions
- **Real-time Updates** - Live data synchronization
- **Performance Optimized** - Lazy loading and efficient state management

## 📱 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/400x300/10B981/FFFFFF?text=Dashboard+View)

### Member Management
![Members](https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Member+Management)

### Invoice Generation
![Invoices](https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Invoice+System)

### Data Management
![Data Management](https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Data+Export)

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible components
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Backend
- **Express.js** - Fast, unopinionated web framework
- **Node.js** - JavaScript runtime
- **JWT** - Secure authentication
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### Data Export
- **jsPDF** - PDF generation
- **jszip** - ZIP file creation
- **CSV Export** - Spreadsheet compatibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/tristar-fitness.git
cd tristar-fitness
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Start the backend server** (Recommended - for full functionality)
```bash
# Windows
start-backend.bat

# Unix/Linux/Mac
chmod +x start-backend.sh
./start-backend.sh

# Or manually:
cd backend
npm install
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

The backend will run on `http://localhost:5000`

### 🔧 **Backend Connection Status**

The app now shows a **Backend Status** indicator in the navigation:
- 🟢 **"Backend Connected"** - Full functionality with server-side data persistence
- 🟡 **"Offline Mode"** - Local storage only (works without backend)

**Note:** The app works in both modes, but with backend you get:
- Persistent data across sessions
- Better security
- Real-time synchronization
- Professional features

## 👥 Demo Credentials

### Owner Account
- **Username:** `owner`
- **Password:** `any`
- **Access:** Full system access

### Trainer Accounts
- **Username:** `trainer1` | **Password:** `any` | **Name:** Yash
- **Username:** `trainer2` | **Password:** `any` | **Name:** Mohit Sen  
- **Username:** `trainer3` | **Password:** `any` | **Name:** Palak Dubey

## 📊 Sample Data

The system comes pre-loaded with sample data:

- **5 Members** - Various membership types and statuses
- **3 Trainers** - Different specializations and schedules
- **3 Invoices** - Sample billing data
- **2 Follow-ups** - Pending reminders
- **9 Activities** - System audit trail

## 🎯 Key Features Walkthrough

### 1. Dashboard Analytics
- Real-time member statistics
- Revenue tracking
- Expiring membership alerts
- Recent activity feed

### 2. Member Management
- Add new members with validation
- Track membership status
- View visit history
- Manage trainer assignments

### 3. Invoice System
- Generate professional PDF invoices
- Multiple payment packages
- Tax calculation (18% GST)
- Email-ready formats

### 4. Data Management
- Export to CSV, PDF, or ZIP
- Import backup data
- Generate comprehensive reports
- Clear all data option

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=TriStar Fitness

# Backend (if using)
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Customization

#### Branding
Update colors in `tailwind.config.ts`:
```typescript
colors: {
  tristar: {
    50: '#f0fdf4',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  }
}
```

#### Features
- Enable/disable features in `src/lib/features.ts`
- Customize validation rules in form components
- Modify PDF templates in `src/lib/pdfGenerator.ts`

## 📱 Mobile Experience

The application is fully responsive with:
- **Mobile-first design** - Optimized for small screens
- **Touch-friendly** - Large buttons and gestures
- **Fast loading** - Optimized assets and lazy loading
- **Offline capability** - Local storage for critical data

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Granular permissions
- **Input Validation** - Server-side validation
- **Rate Limiting** - API protection
- **CORS Protection** - Cross-origin security
- **XSS Prevention** - Content security policies

## 📈 Performance Optimizations

- **Code Splitting** - Lazy-loaded components
- **Image Optimization** - WebP format support
- **Bundle Analysis** - Monitor bundle size
- **Caching Strategy** - Efficient data caching
- **Virtual Scrolling** - Large list optimization

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
```bash
npm run test:e2e
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Docker Deployment
```bash
docker build -t tristar-fitness .
docker run -p 3000:3000 tristar-fitness
```

## 🔄 Development Workflow

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request
5. Code review
6. Merge to main

## 📋 Roadmap

### Phase 1 (Current)
- ✅ Core member management
- ✅ Invoice generation
- ✅ Basic reporting
- ✅ Responsive design

### Phase 2 (Planned)
- 🔄 Advanced analytics
- 🔄 Payment integration
- 🔄 SMS notifications
- 🔄 Mobile app

### Phase 3 (Future)
- 📅 AI-powered insights
- 📅 Integration APIs
- 📅 Multi-location support
- 📅 Advanced scheduling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Nishchay Gupta**

- GitHub: [@nishchaygupta](https://github.com/nishchaygupta)
- LinkedIn: [Nishchay Gupta](https://linkedin.com/in/nishchaygupta)
- Email: nishchay@tristarfitness.com

## 🙏 Acknowledgments

- **Shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **React Team** - Amazing framework
- **Express.js** - Robust backend framework

## 📞 Support

- **Documentation:** [docs.tristarfitness.com](https://docs.tristarfitness.com)
- **Issues:** [GitHub Issues](https://github.com/your-username/tristar-fitness/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/tristar-fitness/discussions)
- **Email:** support@tristarfitness.com

---

**Made with ❤️ for TriStar Fitness**

*Empowering gym owners with professional management tools*
#   D e p l o y m e n t   U p d a t e  
 