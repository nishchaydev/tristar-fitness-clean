import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  UserCog, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  Clock,
  CheckCircle,
  Clock3,
  Database,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { formatINR } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { isOwner } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { useDataStore } from '@/lib/dataSync'


const Dashboard = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  
  // Get synchronized data from the store
  const { 
    members, 
    visitors, 
    invoices,
    followUps,
    activities,
    getExpiringMembers,
    getActiveSessions,
    getPendingFollowUps,
    getRecentActivities,
    addFollowUp,
    updateFollowUp,
    addActivity,
    initializeDemoData
  } = useDataStore()
  
  // Calculate real-time stats
  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const monthlyRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0)
  
  // Get current month's revenue
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenueData = paidInvoices.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt)
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
  })
  const currentMonthRevenue = monthlyRevenueData.reduce((sum, i) => sum + i.total, 0)
  
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    expiringMembers: getExpiringMembers().length,
    totalVisitors: visitors.filter(v => v.status === 'checked-in').length,
    monthlyRevenue: monthlyRevenue,
    pendingInvoices: invoices.filter(i => i.status === 'pending').length,
    pendingFollowUps: getPendingFollowUps().length
  }

  const expiringMembers = getExpiringMembers().slice(0, 3).map(member => ({
    id: member.id,
    name: member.name,
    expiryDate: member.expiryDate,
    phone: member.phone,
    email: member.email,
    membershipType: member.membershipType
  }))

  // Get recent activities from store
  const recentActivities = getRecentActivities(8)

  // Handle follow-up actions
  const handleFollowUpAction = (followUpId: string, action: 'complete' | 'snooze') => {
    const followUp = followUps.find(f => f.id === followUpId)
    if (!followUp) return

    if (action === 'complete') {
      updateFollowUp(followUpId, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      
      // Add activity
      addActivity({
        type: 'followup',
        action: 'Follow-up completed',
        name: followUp.memberName,
        time: new Date().toISOString(),
        details: `Completed follow-up for ${followUp.type}`,
        memberId: followUp.memberId
      })

      toast({
        title: "Follow-up Completed",
        description: `Follow-up for ${followUp.memberName} marked as completed.`,
      })
    } else if (action === 'snooze') {
      const newDueDate = new Date()
      newDueDate.setDate(newDueDate.getDate() + 3) // Snooze for 3 days
      
      updateFollowUp(followUpId, {
        status: 'snoozed',
        dueDate: newDueDate.toISOString().split('T')[0]
      })

      toast({
        title: "Follow-up Snoozed",
        description: `Follow-up for ${followUp.memberName} snoozed for 3 days.`,
      })
    }
  }

  // Create follow-up for expiring member
  const createFollowUp = (member: typeof expiringMembers[0]) => {
    const existingFollowUp = followUps.find(f => 
      f.memberId === member.id && f.type === 'membership_expiry' && f.status === 'pending'
    )

    if (!existingFollowUp) {
      addFollowUp({
        memberId: member.id,
        memberName: member.name,
        type: 'membership_expiry',
        status: 'pending',
        dueDate: member.expiryDate,
        notes: `Membership expires on ${format(parseISO(member.expiryDate), 'dd MMM yyyy')}`,
        createdAt: new Date().toISOString()
      })

      // Add activity
      addActivity({
        type: 'followup',
        action: 'Follow-up created',
        name: member.name,
        time: new Date().toISOString(),
        details: 'Membership expiry follow-up created',
        memberId: member.id
      })

      toast({
        title: "Follow-up Created",
        description: `Follow-up created for ${member.name}'s expiring membership.`,
      })
    } else {
      toast({
        title: "Follow-up Exists",
        description: `A follow-up already exists for ${member.name}.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Debug Info:</strong> Members: {members.length} | 
            Visitors: {visitors.length} | 
            Invoices: {invoices.length} | 
            Follow-ups: {followUps.length} |
            Activities: {activities.length} |
            User: {user?.username} ({user?.name})
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}! You have full access to all gym management features.
          </p>
          <div className="mt-2">
            <Button
              onClick={() => initializeDemoData()}
              variant="outline"
              size="sm"
              className="hover:scale-105 transition-transform duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Demo Data
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          {isOwner(user) && (
            <Link to="/add-member">
              <Button className="bg-green-600 hover:bg-green-700">
                <Users className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Link to="/members" className="block group">
          <Card className="stat-card card-hover bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Members</CardTitle>
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{stats.totalMembers}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="text-green-600 dark:text-green-400 font-medium">+12</span> from last month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/members" className="block group">
          <Card className="stat-card card-hover bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Active Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{stats.activeMembers}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="text-green-600 dark:text-green-400 font-medium">94.7%</span> retention rate
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/visitors" className="block group">
          <Card className="stat-card card-hover bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Visitors Today</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{stats.totalVisitors}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="text-blue-600 dark:text-blue-400 font-medium">+5</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </Link>

        {isOwner(user) ? (
          <Link to="/invoices" className="block group">
            <Card className="stat-card card-hover bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Monthly Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{formatINR(currentMonthRevenue)}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span className="text-green-600 dark:text-green-400 font-medium">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Memberships Alert - Owner Only */}
        {isOwner(user) && (
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Expiring Memberships</span>
                <Badge variant="destructive">{stats.expiringMembers}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expires: {format(parseISO(member.expiryDate), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => createFollowUp(member)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Follow-up
                      </Button>
                      <Link to={`/edit-member/${member.id}?renew=true&name=${encodeURIComponent(member.name)}&email=${encodeURIComponent(member.email)}&phone=${encodeURIComponent(member.phone)}&membershipType=${member.membershipType}`}>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Renew
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/members">
                <Button variant="outline" className="w-full mt-4">
                  View All Members
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <span>Recent Activity</span>
              <Badge variant="secondary">{recentActivities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                  <div key={`${activity.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'member' && <Users className="h-5 w-5 text-green-600" />}
                      {activity.type === 'visitor' && <UserCheck className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'invoice' && <FileText className="h-5 w-5 text-orange-600" />}
                      {activity.type === 'followup' && <Clock className="h-5 w-5 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.name}</p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">{activity.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(parseISO(activity.time), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              {recentActivities.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups Section - Owner Only */}
      {isOwner(user) && stats.pendingFollowUps > 0 && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Pending Follow-ups</span>
              <Badge variant="secondary">{stats.pendingFollowUps}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPendingFollowUps().slice(0, 5).map((followUp, index) => (
                <div key={`${followUp.id}-${index}`} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{followUp.memberName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{followUp.notes}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Due: {format(parseISO(followUp.dueDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex space-x-2">
                                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollowUpAction(followUp.id, 'snooze')}
                      >
                        <Clock3 className="h-4 w-4 mr-1" />
                        Snooze
                      </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleFollowUpAction(followUp.id, 'complete')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/visitors">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:scale-105 transition-transform duration-200">
                <UserCheck className="h-6 w-6 text-blue-600" />
                <span>Scan Visitor QR</span>
              </Button>
            </Link>
            {isOwner(user) && (
              <Link to="/invoices">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:scale-105 transition-transform duration-200">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <span>Generate Invoice</span>
                </Button>
              </Link>
            )}
            {isOwner(user) && (
              <Link to="/add-member">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:scale-105 transition-transform duration-200">
                  <Users className="h-6 w-6 text-green-600" />
                  <span>Add Member</span>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management Section - Owner Only */}
      {isOwner(user) && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Database className="h-5 w-5 text-indigo-600" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/data-management">
                <Button variant="outline" className="w-full h-16 flex flex-col space-y-2 hover:scale-105 transition-transform duration-200">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm">Export Data</span>
                </Button>
              </Link>
              <Link to="/members">
                <Button variant="outline" className="w-full h-16 flex flex-col space-y-2 hover:scale-105 transition-transform duration-200">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Manage Members</span>
                </Button>
              </Link>
              <Link to="/followup">
                <Button variant="outline" className="w-full h-16 flex flex-col space-y-2 hover:scale-105 transition-transform duration-200">
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">Follow-ups</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
