# Tristar Fitness Management System

A comprehensive fitness management application built with React, TypeScript, and modern web technologies. This system provides gym owners, trainers, and members with powerful tools for managing memberships, scheduling, invoicing, and business analytics.

## 🚀 Features

### Core Management
- **Member Management**: Complete member profiles, membership tracking, and expiration notifications
- **Trainer Management**: Trainer profiles, specializations, and availability tracking
- **Session Management**: Class scheduling, attendance tracking, and capacity management
- **Visitor Management**: Guest passes and temporary access control

### Business Operations
- **Invoice Generation**: Professional PDF invoices with customizable templates
- **Follow-up System**: Automated reminders for expiring memberships and pending actions
- **Activity Logging**: Comprehensive audit trail of all system activities
- **Revenue Tracking**: Financial analytics and reporting

### User Experience
- **Role-based Access Control**: Different interfaces for owners, trainers, and members
- **Responsive Design**: Modern UI built with Shadcn/ui components
- **Real-time Updates**: Live data synchronization across all components
- **Intuitive Navigation**: Clean, organized interface for all user types

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Components**: Shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tristar-fitness-clean.git
   cd tristar-fitness-clean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── forms/          # Form components
│   └── ui/             # Base UI components (Shadcn/ui)
├── lib/                # Core utilities and business logic
│   ├── analytics/      # Analytics engine (future enhancement)
│   ├── scheduling/     # Smart scheduling system (future enhancement)
│   ├── dataSync.ts     # Centralized state management
│   ├── pdfGenerator.ts # PDF generation utilities
│   └── utils.ts        # Helper functions
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Main dashboard with role-based views
│   ├── Members.tsx     # Member management
│   ├── Trainers.tsx    # Trainer management
│   ├── Sessions.tsx    # Session scheduling
│   ├── Visitors.tsx    # Visitor management
│   └── Invoices.tsx    # Invoice generation and management
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication and authorization
└── types/              # TypeScript type definitions
    └── index.ts        # Global type definitions
```

## 👥 User Roles & Permissions

### Owner
- Full access to all features
- Financial analytics and reporting
- Member and trainer management
- System configuration

### Trainer
- View assigned sessions
- Member progress tracking
- Schedule management
- Limited administrative access

### Member
- Personal profile management
- Session booking and history
- Invoice viewing
- Progress tracking

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📊 Key Features in Detail

### Dashboard
- **Overview Tab**: Key metrics, recent activities, and pending follow-ups
- **Statistics Grid**: Member count, trainer count, active sessions, and revenue
- **Recent Activity**: Live feed of system activities
- **Follow-up Management**: Automated reminders and status tracking

### Member Management
- Complete member profiles with contact information
- Membership type and expiration tracking
- Automatic follow-up generation for expiring memberships
- Member search and filtering

### Invoice System
- Professional PDF invoice generation
- Customizable invoice templates
- Tax calculations and itemized billing
- Due date tracking and notes

### Activity Logging
- Comprehensive audit trail
- Automatic logging of all CRUD operations
- User action tracking
- System event logging

## 🚧 Future Enhancements

The following features are planned for future releases:

- **Advanced Analytics Dashboard**: Business intelligence and reporting
- **Smart Scheduling System**: AI-powered class optimization
- **Mobile Application**: React Native companion app
- **API Integration**: Third-party fitness tracking services
- **Advanced Reporting**: Custom report builder
- **Multi-location Support**: Franchise management capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

---

**Tristar Fitness Management System** - Empowering fitness businesses with modern technology solutions.
