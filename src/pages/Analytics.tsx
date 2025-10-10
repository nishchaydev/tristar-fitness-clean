import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  BarChart3,
  Download,
  PieChart,
  Activity,
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { useDataStore } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns'

const Analytics = () => {
  const { user } = useAuth()
  const { members, invoices, checkIns, activities, followUps, proteins } = useDataStore()
  const navigate = useNavigate()

  // Calculate revenue data
  const membershipRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const proteinRevenue = proteins
    .reduce((sum, p) => sum + (p.sellingPrice * p.unitsSold), 0)

  const totalRevenue = membershipRevenue + proteinRevenue

  const pendingRevenue = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const overdueRevenue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const proteinProfit = proteins
    .reduce((sum, p) => sum + ((p.sellingPrice - p.basePrice) * p.unitsSold), 0)

  // Calculate monthly revenue trend (last 6 months)
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const date = subDays(new Date(), i * 30)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    
    const monthRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.createdAt)
        return inv.status === 'paid' && invDate >= monthStart && invDate <= monthEnd
      })
      .reduce((sum, inv) => sum + inv.amount, 0)
    
    monthlyRevenue.push({
      month: format(monthStart, 'MMM yyyy'),
      revenue: monthRevenue
    })
  }

  // Calculate membership distribution
  const membershipDistribution = members.reduce((acc, member) => {
    const type = member.membershipType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate check-in trends
  const today = new Date().toDateString()
  const todayCheckIns = checkIns.filter(checkIn => 
    new Date(checkIn.checkInTime).toDateString() === today
  ).length

  const weekCheckIns = checkIns.filter(checkIn => {
    const checkInDate = new Date(checkIn.checkInTime)
    const weekAgo = subDays(new Date(), 7)
    return checkInDate >= weekAgo
  }).length

  // Calculate member retention
  const activeMembers = members.filter(m => m.status === 'active').length
  const totalMembers = members.length
  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0

  // Calculate average check-ins per member
  const avgCheckInsPerMember = totalMembers > 0 ? Math.round((checkIns.length / totalMembers) * 10) / 10 : 0

  // Export data function (send current app data to backend and download XLSX)
  const exportData = async () => {
    const download = async (res: Response) => {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    }
    try {
      // Preferred: POST real data
      let res = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Authorization': `Bearer demo-static-token`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ members, invoices, activities })
      })
      if (!res.ok) throw new Error('POST export failed')
      await download(res)
    } catch (e) {
      try {
        // Fallback: GET server-side export
        const res = await fetch('/api/analytics/export', {
          method: 'GET',
          headers: { 'Authorization': `Bearer demo-static-token` },
        })
        if (!res.ok) throw new Error('GET export failed')
        await download(res)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-purple-100 mt-2">Business insights and performance metrics</p>
          </div>
          <Button onClick={exportData} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => navigate('/invoices')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ₹{pendingRevenue.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

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
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {retentionRate}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => navigate('/member-checkin')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Check-ins</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayCheckIns}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {weekCheckIns} this week
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
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{followUps.filter(f => f.status === 'pending').length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Revenue Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Membership Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From memberships</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{membershipRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {invoices.filter(i => i.status === 'paid').length} invoices
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Protein Store Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From supplement sales</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{proteinRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ₹{proteinProfit.toLocaleString()} profit
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Total Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Combined revenue</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All sources
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Pending Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting payment</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">₹{pendingRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {invoices.filter(i => i.status === 'pending').length} invoices
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Overdue Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Past due date</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">₹{overdueRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {invoices.filter(i => i.status === 'overdue').length} invoices
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              <span>Membership Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(membershipDistribution).map(([type, count]) => {
                const percentage = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{count}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{percentage}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Monthly Revenue Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{month.month}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{month.revenue.toLocaleString()}</p>
                  <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue), 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{retentionRate}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {activeMembers} of {totalMembers} members active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{weekCheckIns}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Check-ins in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activities.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              All-time activities logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historic Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span>Recent Check-ins</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {checkIns.slice(-10).reverse().map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{checkIn.memberName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {format(parseISO(checkIn.checkInTime), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400">
                    Checked In
                  </Badge>
                </div>
              ))}
              {checkIns.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No check-ins recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activities.slice(-10).reverse().map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.name} • {format(parseISO(activity.time), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activities recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics


