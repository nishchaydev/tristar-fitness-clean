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
  Clock3
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
    trainers, 
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
    debugStore
  } = useDataStore()
  
  // Debug: Log store state on component mount
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard Data Store State:', debugStore())
    }
  }, [debugStore])
  
  // Calculate real-time stats
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    expiringMembers: getExpiringMembers().length,
    totalVisitors: visitors.filter(v => v.status === 'checked-in').length,
    checkedInTrainers: trainers.filter(t => t.status === 'available' || t.status === 'busy').length,
    totalTrainers: trainers.length,
    monthlyRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Debug Info:</strong> Members: {members.length} | 
            Trainers: {trainers.length} | 
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! {isOwner(user) ? 'You have full access to all features.' : 'You have limited access to trainer features.'}
          </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/members" className="block">
          <Card className="stat-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> from last month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/members" className="block">
          <Card className="stat-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">{stats.activeMembers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">94.7%</span> retention rate
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/visitors" className="block">
          <Card className="stat-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitors Today</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">{stats.totalVisitors}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+5</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </Link>

        {isOwner(user) ? (
          <Link to="/invoices" className="block">
            <Card className="stat-card card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient">{formatINR(stats.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link to="/trainers" className="block">
            <Card className="stat-card card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                <UserCog className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient">8</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-purple-600">+2</span> from yesterday
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Memberships Alert - Owner Only */}
        {isOwner(user) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Expiring Memberships</span>
                <Badge variant="destructive">{stats.expiringMembers}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">Expires: {format(parseISO(member.expiryDate), 'dd MMM yyyy')}</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Recent Activity</span>
              <Badge variant="secondary">{recentActivities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivities
                .filter(activity => {
                  // Trainers can't see member/invoice activities
                  if (!isOwner(user) && (activity.type === 'member' || activity.type === 'invoice')) {
                    return false
                  }
                  return true
                })
                .map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'member' && <Users className="h-5 w-5 text-green-600" />}
                      {activity.type === 'visitor' && <UserCheck className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'trainer' && <UserCog className="h-5 w-5 text-purple-600" />}
                      {activity.type === 'invoice' && <FileText className="h-5 w-5 text-orange-600" />}
                      {activity.type === 'followup' && <Clock className="h-5 w-5 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.name}</p>
                      {activity.details && (
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(parseISO(activity.time), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              {recentActivities.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups Section - Owner Only */}
      {isOwner(user) && stats.pendingFollowUps > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Pending Follow-ups</span>
              <Badge variant="secondary">{stats.pendingFollowUps}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPendingFollowUps().slice(0, 5).map((followUp) => (
                <div key={followUp.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">{followUp.memberName}</p>
                    <p className="text-sm text-gray-600">{followUp.notes}</p>
                    <p className="text-xs text-gray-500">Due: {format(parseISO(followUp.dueDate), 'dd MMM yyyy')}</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/visitors">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <UserCheck className="h-6 w-6 text-blue-600" />
                <span>Scan Visitor QR</span>
              </Button>
            </Link>
            <Link to="/trainers">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <UserCog className="h-6 w-6 text-purple-600" />
                <span>{isOwner(user) ? 'Trainer Check-in' : 'My Schedule'}</span>
              </Button>
            </Link>
            {isOwner(user) && (
              <Link to="/invoices">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <span>Generate Invoice</span>
                </Button>
              </Link>
            )}
            {isOwner(user) && (
              <Link to="/add-member">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Users className="h-6 w-6 text-green-600" />
                  <span>Add Member</span>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
