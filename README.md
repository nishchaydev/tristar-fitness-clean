# TriStar Fitness - Gym Management System

A comprehensive gym management web application built with React 19, TypeScript, and Express.js. Features role-based access control, member management, invoice generation, and real-time analytics.

## 🚀 Features

### **User Roles**
- **Owner**: Full system access including revenue analytics and data management
- **Manager**: Daily operations including member check-ins, invoice generation, and follow-ups

### **Core Functionality**
- **Member Management**: Add, edit, and track member information
- **Daily Check-ins**: Real-time member attendance tracking
- **Invoice System**: Professional PDF invoice generation with GST
- **Visitor Management**: Track trial visitors and create follow-ups
- **Follow-up System**: Task management with notes and scheduling
- **Analytics Dashboard**: Business insights and performance metrics
- **Role-based Security**: JWT authentication with protected routes

### **Technical Features**
- **Responsive Design**: Works seamlessly on PC and mobile
- **Real-time Updates**: Live data synchronization
- **Professional Invoices**: Branded PDF generation with TriStar logo
- **Data Export**: Comprehensive reporting capabilities (PDF, Excel)
- **Offline Support**: Local data storage with backend sync
- **PWA Support**: Installable app with service worker
- **Dark Mode**: Toggle between light and dark themes
- **Professional Branding**: TriStar Fitness logo and consistent styling

## 🛠️ Tech Stack

### **Frontend**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- Zustand for state management
- React Router for navigation
- React Hook Form with Zod validation

### **Backend**
- Express.js with Node.js
- JWT authentication
- Express-validator for input validation
- Helmet for security
- Winston for logging
- CORS and rate limiting

### **Additional Tools**
- PDF generation with jsPDF
- QR code generation
- Date manipulation with date-fns
- Toast notifications

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd tristar-fitness-clean
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Start the application**
```bash
# Option 1: Use the startup script (Recommended)
npm start

# Option 2: PowerShell script
.\start-servers.ps1

# Option 3: Manual start
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

### **Access the Application**
- **Frontend**: http://localhost:6969
- **Backend API**: http://localhost:6868
- **API Health Check**: http://localhost:6868/api/health

## 👥 Demo Accounts

### **Owner Account**
- **Username**: `owner`
- **Password**: `demo123`
- **Name**: Nikhil Verma
- **Access**: Full system access including analytics and data management

### **Manager Account**
- **Username**: `manager`
- **Password**: `demo123`
- **Name**: Manager
- **Access**: Daily operations, member management, and follow-ups

## 📱 Usage

### **For Gym Owners**
1. **Dashboard**: View comprehensive business metrics and revenue analytics
2. **Analytics**: Monitor member growth, retention rates, and financial performance
3. **Data Management**: Export data and manage system settings
4. **Full Access**: All manager features plus business intelligence

### **For Gym Managers**
1. **Member Check-ins**: Track daily member attendance
2. **Member Management**: Add, edit, and manage member profiles
3. **Invoice Generation**: Create professional invoices for memberships and services
4. **Follow-ups**: Manage visitor follow-ups and member communications
5. **Visitor Tracking**: Record visitor information for follow-up purposes

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=6868
NODE_ENV=production
JWT_SECRET=your-secret-key
```

### **Frontend Configuration**
The frontend automatically connects to the backend API. No additional configuration required.

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### **Members**
- `GET /api/members` - Get all members
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### **Invoices**
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id/pdf` - Download PDF invoice

### **Analytics**
- `GET /api/analytics` - Get business analytics

## 🚀 Deployment

### **Production Build**
```bash
# Build frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

### **Docker Deployment**
```bash
# Build and run with Docker
docker-compose up --build
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Owner and Manager permissions
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API rate limiting for security
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- **Touch-friendly Interface**: Optimized for touch interactions
- **Responsive Layout**: Adapts to all screen sizes
- **Mobile Navigation**: Collapsible sidebar for mobile
- **Fast Loading**: Optimized for mobile performance

## 📱 PWA Features

### **Installation**
- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Add to Home Screen from browser menu
- **Offline Access**: Core functionality works without internet connection

### **PWA Capabilities**
- **Service Worker**: Caches resources for offline use
- **App Manifest**: Defines app metadata and icons
- **Responsive Design**: Optimized for all screen sizes
- **Fast Loading**: Cached resources load instantly

## 🚀 Production Deployment

### **Build for Production**
```bash
# Build frontend
npm run build:prod

# Build backend (if needed)
cd backend && npm run build
```

### **Environment Variables**
Create `.env` files in both root and backend directories:
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:6868

# Backend (.env)
PORT=6868
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### **Deployment Options**
- **Local Network**: Run on gym's local network
- **Cloud Hosting**: Deploy to Vercel, Netlify, or similar
- **Self-hosted**: Use Docker or traditional hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Integration with payment gateways
- [ ] Multi-location support
- [ ] Advanced analytics dashboard
- [ ] Automated email notifications

---

**TriStar Fitness** - Your complete gym management solution 🏋️‍♂️