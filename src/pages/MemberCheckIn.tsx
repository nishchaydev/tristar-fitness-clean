import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import { 
  UserCheck, 
  Search, 
  Clock, 
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useDataStore } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'

const MemberCheckIn = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { members, checkIns, addCheckIn, addActivity } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter active members strictly by status and expiry date
  const activeMembers = members.filter(member => {
    if (member.status !== 'active') return false
    const expiry = (member as any).expiryDate || (member as any).endDate
    if (!expiry) return true
    return new Date(expiry) >= new Date()
  })
  
  // Filter members based on search
  const filteredMembers = activeMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get today's check-ins
  const today = new Date().toDateString()
  const todayCheckIns = checkIns.filter(checkIn => 
    new Date(checkIn.checkInTime).toDateString() === today
  )

  // Get member check-in count for today
  const getMemberCheckInCount = (memberId: string) => {
    return todayCheckIns.filter(checkIn => checkIn.memberId === memberId).length
  }

  // Handle member check-in
  const handleCheckIn = async (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return

    // Only allow active members to check in
    if (member.status !== 'active' || (member as any).expiryDate && new Date((member as any).expiryDate) < new Date()) {
      toast({ title: 'Inactive Membership', description: 'Only active members can be checked in.', variant: 'destructive' })
      return
    }

    // Check if already checked in today
    const alreadyCheckedIn = todayCheckIns.some(checkIn => checkIn.memberId === memberId)
    if (alreadyCheckedIn) {
      toast({
        title: "Already Checked In",
        description: `${member.name} has already checked in today.`,
        variant: "destructive"
      })
      return
    }

    try {
      // First update the local state
      addCheckIn({
        memberId: memberId,
        memberName: member.name,
        checkInTime: new Date().toISOString(),
        date: today
      })

      // Then update the backend
      const totalVisits = (member.totalVisits || 0) + 1;
      const updates = {
        totalVisits,
        lastVisit: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Call the backend API to update the member
      await apiClient.updateMember(memberId, updates);

      // Add activity
      addActivity({
        type: 'checkin',
        action: 'Member checked in',
        name: member.name,
        time: new Date().toISOString(),
        details: `Daily check-in at ${new Date().toLocaleTimeString()}`,
        memberId: memberId
      })

      toast({
        title: "Check-in Successful",
        description: `${member.name} has been checked in successfully!`,
      })
    } catch (error) {
      console.error('Failed to check in member:', error);
      toast({
        title: "Error",
        description: "Failed to check in member. The check-in may not be properly saved.",
        variant: "destructive"
      });
    }
  }

  // Get check-in statistics
  const stats = {
    totalActiveMembers: activeMembers.length,
    checkedInToday: todayCheckIns.length,
    checkInRate: activeMembers.length > 0 ? Math.round((todayCheckIns.length / activeMembers.length) * 100) : 0,
    averageCheckIns: todayCheckIns.length > 0 ? Math.round(todayCheckIns.length / activeMembers.length * 10) / 10 : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold">Member Check-in</h1>
        <p className="text-blue-100 mt-2">Manage daily member check-ins and track attendance</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalActiveMembers}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total active memberships</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Checked In Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.checkedInToday}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Members checked in</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-in Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.checkInRate}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Today's attendance rate</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageCheckIns}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Per member today</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Search Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const checkInCount = getMemberCheckInCount(member.id)
          const isCheckedIn = checkInCount > 0

          return (
            <Card key={member.id} className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg ${
              isCheckedIn ? 'ring-2 ring-green-500' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{member.name}</CardTitle>
                  {isCheckedIn ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Checked In
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Checked In
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Phone:</strong> {member.phone}</p>
                  <p><strong>Email:</strong> {member.email}</p>
                  <p><strong>Membership:</strong> {member.membershipType}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-1 ${
                      member.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {member.status}
                    </span>
                  </p>
                </div>

                {checkInCount > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Check-ins today:</strong> {checkInCount}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Last check-in: {format(parseISO(todayCheckIns.find(c => c.memberId === member.id)?.checkInTime || ''), 'HH:mm')}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleCheckIn(member.id)}
                  disabled={isCheckedIn}
                  className={`w-full ${
                    isCheckedIn 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isCheckedIn ? 'Already Checked In' : 'Check In'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Today's Check-ins Summary */}
      {todayCheckIns.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Today's Check-ins ({todayCheckIns.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{checkIn.memberName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(parseISO(checkIn.checkInTime), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMembers.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Members Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'No active members available for check-in.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MemberCheckIn