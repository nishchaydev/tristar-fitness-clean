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
  BarChart3,
  Package,
  AlertTriangle
} from 'lucide-react'
import { useDataStore } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const { members, followUps, activities, checkIns, proteins, addFollowUp } = useDataStore()
  const navigate = useNavigate()

  // Helper function to calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Calculate statistics
  const activeMembers = members.filter(m => m.status === 'active').length
  const expiredMembers = members.filter(m => {
    const exp = (m as any).expiryDate || (m as any).endDate
    if (!exp) return false
    return getDaysUntilExpiry(exp) < 0
  }).length
  
  const todayCheckIns = checkIns.filter(checkIn => {
    const today = new Date().toDateString()
    return new Date(checkIn.checkInTime).toDateString() === today
  }).length

  const pendingFollowUps = followUps.filter(f => f.status === 'pending').length

  const recentActivities = activities.slice(0, 5)

  // Protein store alerts
  const lowStockProducts = proteins.filter(p => p.quantityInStock < 5)
  const nearExpiryProducts = proteins.filter(p => {
    if (!p.expiryDate) return false
    const expiry = new Date(p.expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  })

  // Get expiring memberships (within 10 days)
  const expiringMembers = members
    .filter(member => {
      const expiry = (member as any).expiryDate || (member as any).endDate
      if (!expiry) return false
      const daysLeft = getDaysUntilExpiry(expiry)
      return daysLeft <= 10 && daysLeft >= 0 && member.status === 'active'
    })
    .sort((a, b) => {
      const aExp = (a as any).expiryDate || (a as any).endDate
      const bExp = (b as any).expiryDate || (b as any).endDate
      return getDaysUntilExpiry(aExp) - getDaysUntilExpiry(bExp)
    })
    .slice(0, 5) // Show top 5 most urgent

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mt-2">Here's what's happening at Tri Star Fitness today</p>
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
                const expiry = (member as any).expiryDate || (member as any).endDate
                const daysLeft = getDaysUntilExpiry(expiry)
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
                    <div className="text-right space-y-2">
                      <Badge className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor()}`}>
                        {daysLeft === 0 ? 'Expires Today' : `${daysLeft} days left`}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Expires: {new Date(expiry).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => addFollowUp({
                          memberId: member.id,
                          memberName: member.name,
                          type: 'membership_renewal',
                          status: 'pending',
                          dueDate: (member as any).expiryDate || (member as any).endDate,
                          notes: `Membership expiring in ${daysLeft} day(s)`
                        })}
                        className="text-sm px-3 py-1 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300"
                      >
                        Create Follow-up
                      </button>
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

      {/* Protein Store Alerts */}
      {(lowStockProducts.length > 0 || nearExpiryProducts.length > 0) && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <span>Protein Store Alerts</span>
              <Badge variant="outline" className="ml-auto">
                {lowStockProducts.length + nearExpiryProducts.length} alerts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Low Stock Products
                  </h4>
                  <div className="space-y-2">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="text-red-700 dark:text-red-300">{product.name}</span>
                        <Badge variant="destructive">{product.quantityInStock} left</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nearExpiryProducts.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Products Near Expiry
                  </h4>
                  <div className="space-y-2">
                    {nearExpiryProducts.map((product) => {
                      const expiry = new Date(product.expiryDate!);
                      const today = new Date();
                      const diffTime = expiry.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="text-yellow-700 dark:text-yellow-300">{product.name}</span>
                          <Badge variant="secondary">{diffDays} days left</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={() => navigate('/protein-store')}
                  className="w-full text-center py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  Manage Protein Store →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                onClick={() => navigate('/protein-store')}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Protein Store</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage supplements</div>
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
