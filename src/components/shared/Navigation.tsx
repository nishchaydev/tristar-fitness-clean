import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  UserCog, 
  FileText,
  Database,
  Dumbbell,
  LogOut,
  User,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import BackendStatus from './BackendStatus'

const Navigation = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, requiredRole: 'trainer' },
    { path: '/trainers', label: 'Trainers', icon: UserCog, requiredRole: 'trainer' },
    { path: '/invoices', label: 'Invoices', icon: FileText, requiredRole: 'owner' },
    { path: '/followup', label: 'Follow-ups', icon: MessageSquare, requiredRole: 'trainer' },
    { path: '/data-management', label: 'Data', icon: Database, requiredRole: 'owner' },
  ]

  return (
    <nav className="nav-enhanced sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-tristar-600 dark:group-hover:text-tristar-400 transition-colors duration-200">
                  TriStar
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                  Fitness & Wellness
                </p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Items */}
            <div className="flex space-x-1">
              {navItems
                .filter(item => {
                  if (item.requiredRole === 'owner') {
                    return user?.role === 'owner'
                  }
                  return true // Trainers and semi-admin can see trainer-level items
                })
                .map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`nav-item flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 ${
                          isActive 
                            ? 'bg-tristar-600 hover:bg-tristar-700 text-white shadow-lg' 
                            : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md font-medium'
                        }`}
                      >
                        <Icon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
            </div>

            {/* Backend Status */}
            <BackendStatus />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Info and Logout */}
            {user && (
              <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-600 pl-4">
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <span className="text-white font-semibold text-sm leading-none">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-32">{user.name}</p>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant={user.role === 'owner' ? 'default' : user.role === 'semi-admin' ? 'secondary' : 'secondary'}
                        className="text-xs px-2 py-0.5"
                      >
                        {user.role === 'owner' ? '🏢 Owner' : user.role === 'semi-admin' ? '👨‍💼 Semi-Admin' : '🏋️‍♂️ Trainer'}
                      </Badge>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
