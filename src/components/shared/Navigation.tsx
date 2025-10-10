import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  FileText,
  Database,
  Dumbbell,
  LogOut,
  User,
  MessageSquare,
  Users,
  Menu,
  X,
  BarChart3,
  Settings as SettingsIcon,
  UserCheck,
  Clock,
  Sun,
  Moon,
  Package
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, ReactNode } from 'react'
import BackendStatus from '@/components/shared/BackendStatus'
// Import bundled logo asset so it loads reliably in dev/prod
// The source image currently lives at `Images/tristarimage.jpg` in the repo root
// Importing ensures Vite copies and fingerprints it for production builds
// Adjust the path if you relocate the image later
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - allow importing image as URL
import tristarLogoUrl from '../../../Images/tristarimage.jpg'

interface NavigationProps {
  children?: ReactNode
}

const Navigation = ({ children }: NavigationProps) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, requiredRole: 'both' },
    { path: '/members', label: 'Members', icon: Users, requiredRole: 'both' },
    { path: '/invoices', label: 'Invoices', icon: FileText, requiredRole: 'both' },
    { path: '/member-checkin', label: 'Check-in', icon: UserCheck, requiredRole: 'both' },
    { path: '/followups', label: 'Follow-ups', icon: MessageSquare, requiredRole: 'both' },
    { path: '/protein-store', label: 'Protein Store', icon: Package, requiredRole: 'both' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, requiredRole: 'owner' },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, requiredRole: 'both' },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar - hidden on small screens */}
      <nav className="hidden md:flex w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 overflow-hidden">
              <img 
                src={tristarLogoUrl} 
                alt="TriStar Fitness" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                TriStar Fitness
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {user?.role === 'owner' ? 'Gym Owner' : 'Gym (Manager)'} ({user?.role})
              </p>
            </div>
          </Link>
          <div className="mt-3"><BackendStatus /></div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {navItems
              .filter(item => {
                if (item.requiredRole === 'both') return true
                if (item.requiredRole === 'owner' && user?.role === 'owner') return true
                if (item.requiredRole === 'semi-admin' && user?.role === 'semi-admin') return true
                return false
              })
              .map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
          </nav>
        </div>

        {/* Theme Toggle */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <Link to="/dashboard" className="flex items-center space-x-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
                  <img 
                    src={tristarLogoUrl} 
                    alt="TriStar Fitness" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    TriStar Fitness
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.role === 'owner' ? 'Gym Owner' : 'Gym (Manager)'} ({user?.role})
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="px-4 py-6">
              <nav className="space-y-2">
                {navItems
                  .filter(item => {
                    if (item.requiredRole === 'both') return true
                    if (item.requiredRole === 'owner' && user?.role === 'owner') return true
                    if (item.requiredRole === 'semi-admin' && user?.role === 'semi-admin') return true
                    return false
                  })
                  .map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
              </nav>
            </div>

            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mb-3"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
              
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="w-full text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navigation
