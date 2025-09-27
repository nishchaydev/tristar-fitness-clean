import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck,
  AlertCircle,
  Calendar,
  Clock,
  Phone,
  BarChart3
} from 'lucide-react'
import { useDataStore } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const { members, followUps, activities, checkIns } = useDataStore()
  const navigate = useNavigate()

  // Calculate statistics
  const activeMembers = members.filter(m => m.status === 'active').length
  const expiredMembers = members.filter(m => m.status === 'expired').length
  
  const todayCheckIns = checkIns.filter(checkIn => {
    const today = new Date().toDateString()
    return new Date(checkIn.checkInTime).toDateString() === today
  }).length

  const pendingFollowUps = followUps.filter(f => f.status === 'pending').length

  const recentActivities = activities.slice(0, 5)

  // Get expiring memberships (within 30 days)
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const expiringMembers = members
    .filter(member => {
      const daysLeft = getDaysUntilExpiry(member.endDate)
      return daysLeft <= 30 && daysLeft >= 0 && member.status === 'active'
    })
    .sort((a, b) => getDaysUntilExpiry(a.endDate) - getDaysUntilExpiry(b.endDate))
    .slice(0, 5) // Show top 5 most urgent

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mt-2">Here's what's happening at TriStar Fitness today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => navigate('/members')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeMembers}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {expiredMembers} expired
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => navigate('/member-checkin')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Check-ins</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayCheckIns}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Members checked in today
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => navigate('/followups')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Follow-ups</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingFollowUps}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Memberships Panel */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Expiring Memberships</span>
            <Badge variant="outline" className="ml-auto">
              {expiringMembers.length} expiring soon
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringMembers.length > 0 ? (
            <div className="space-y-3">
              {expiringMembers.map((member) => {
                const daysLeft = getDaysUntilExpiry(member.endDate)
                const getUrgencyColor = () => {
                  if (daysLeft <= 3) return 'text-red-600 bg-red-100'
                  if (daysLeft <= 7) return 'text-orange-600 bg-orange-100'
                  if (daysLeft <= 15) return 'text-yellow-600 bg-yellow-100'
                  return 'text-blue-600 bg-blue-100'
                }
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor()}`}>
                        {daysLeft === 0 ? 'Expires Today' : `${daysLeft} days left`}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Expires: {new Date(member.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={() => navigate('/members')}
                  className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  View All Members →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Expiring Memberships</h3>
              <p className="text-gray-600 dark:text-gray-400">All memberships are up to date!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/member-checkin')}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Member Check-in</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Check in members</div>
              </button>
              <button 
                onClick={() => navigate('/members')}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Manage Members</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">View member details</div>
              </button>
              <button 
                onClick={() => navigate('/followups')}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Follow-ups</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage tasks</div>
              </button>
              <button 
                onClick={() => navigate('/visitors')}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Visitor Details</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Track visitors</div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.name} • {new Date(activity.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ManagerDashboard
