import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  UserCheck, 
  UserCog, 
  FileText,
  Dumbbell,
  LogOut,
  User
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Navigation = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, requiredRole: 'trainer' },
    { path: '/members', label: 'Members', icon: Users, requiredRole: 'owner' },
    { path: '/visitors', label: 'Visitors', icon: UserCheck, requiredRole: 'trainer' },
    { path: '/trainers', label: 'Trainers', icon: UserCog, requiredRole: 'trainer' },
    { path: '/invoices', label: 'Invoices', icon: FileText, requiredRole: 'owner' },
  ]

  return (
    <nav className="nav-enhanced">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TriStar Fitness</h1>
              <p className="text-sm text-gray-600">Gym Management System</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Items */}
            <div className="flex space-x-1">
              {navItems
                .filter(item => {
                  if (item.requiredRole === 'owner') {
                    return user?.role === 'owner'
                  }
                  return true // Trainers can see trainer-level items
                })
                .map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`nav-item flex items-center space-x-2 ${
                          isActive 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
            </div>

            {/* User Info and Logout */}
            {user && (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                        {user.role === 'owner' ? '🏢 Owner' : '🏋️‍♂️ Trainer'}
                      </Badge>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
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
