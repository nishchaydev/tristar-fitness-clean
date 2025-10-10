import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, Calendar, UserCheck, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import { formatINR, loadSyncedJSON, toCSV } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { isOwner, isSemiAdmin } from '@/lib/auth'
import { useDataStore } from '@/lib/dataSync'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  membershipType: 'monthly' | 'quarterly' | 'annual'
  startDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'pending'
  lastVisit?: string
  totalVisits: number
}

const Members = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all')
  
  // Get synchronized data from the store
  const { members, deleteMember, pricing } = useDataStore()

  const handleDeleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (member) {
      deleteMember(memberId)
      toast({
        title: "Member Deleted",
        description: `${member.name} has been removed from the system.`,
      })
    }
  }

  const renewMembership = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (member) {
      // In a real app, this would call an API to update the membership
      toast({
        title: "Membership Renewed",
        description: `${member.name}'s membership has been renewed successfully!`,
      })
    }
  }

  const getMembershipPrice = (type: string) => {
    switch (type) {
      case 'monthly': return pricing.monthlyFee
      case 'quarterly': return pricing.quarterlyFee
      case 'annual': return pricing.yearlyFee
      default: return pricing.monthlyFee
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryWarning = (expiryDate: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDate)
    
    if (daysLeft < 0) {
      return { text: 'EXPIRED', color: 'text-red-600 bg-red-100', icon: '⚠️' }
    } else if (daysLeft <= 3) {
      return { text: `${daysLeft} days left`, color: 'text-red-600 bg-red-100', icon: '🚨' }
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: 'text-orange-600 bg-orange-100', icon: '⚠️' }
    } else if (daysLeft <= 30) {
      return { text: `${daysLeft} days left`, color: 'text-yellow-600 bg-yellow-100', icon: '⏰' }
    } else {
      return { text: `${daysLeft} days left`, color: 'text-green-600 bg-green-100', icon: '✅' }
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const activeMembers = members.filter(m => m.status === 'active').length
  const expiredMembers = members.filter(m => {
    const exp = (m as any).expiryDate || (m as any).endDate
    if (!exp) return false
    return getDaysUntilExpiry(exp) < 0
  }).length
  const pendingMembers = members.filter(m => m.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage your gym members and their memberships</p>
        </div>
        {(isOwner(user) || isSemiAdmin(user)) && (
          <Link to="/add-member">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              const rows = await loadSyncedJSON('members')
              if (!rows || rows.length === 0) {
                toast({
                  title: 'No Data',
                  description: 'No member data available to print',
                  variant: 'destructive'
                })
                return
              }
              
              const w = window.open('', '_blank')
              if (!w) return
              
              // Create a proper HTML table with member data
              const headers = ['Name', 'Email', 'Phone', 'Membership Type', 'Start Date', 'End Date', 'Status', 'Total Visits']
              const tableRows = rows.map(member => [
                member.name || '',
                member.email || '',
                member.phone || '',
                member.membershipType || '',
                member.startDate ? new Date(member.startDate).toLocaleDateString() : '',
                member.expiryDate || member.endDate ? new Date(member.expiryDate || member.endDate).toLocaleDateString() : '',
                member.status || '',
                member.totalVisits || 0
              ])
              
              const html = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Tri Star Fitness - Members Report</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #2563eb; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .date { color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Tri Star Fitness</h1>
                    <h2>Members Report</h2>
                    <p class="date">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                  </div>
                  <table>
                    <thead>
                      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                      ${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                  </table>
                  <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Total Members: ${rows.length}
                  </p>
                </body>
                </html>
              `
              
              w.document.write(html)
              w.document.close()
              w.focus()
              w.print()
              
              toast({
                title: 'Print Ready',
                description: 'Member data has been prepared for printing'
              })
            } catch (error) {
              console.error('Print error:', error)
              toast({
                title: 'Print Error',
                description: 'Failed to prepare data for printing',
                variant: 'destructive'
              })
            }
          }}>Print Data</Button>
          <Button variant="outline" onClick={async () => {
            try {
              const rows = await loadSyncedJSON('members')
              if (!rows || rows.length === 0) {
                toast({
                  title: 'No Data',
                  description: 'No member data available to export',
                  variant: 'destructive'
                })
                return
              }
              
              const csv = toCSV(rows)
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `tri-star-fitness-members_${new Date().toISOString().slice(0,10)}.csv`
              a.click()
              URL.revokeObjectURL(url)
              
              toast({
                title: 'Export Successful',
                description: 'Member data has been exported to CSV'
              })
            } catch (error) {
              console.error('Export error:', error)
              toast({
                title: 'Export Error',
                description: 'Failed to export member data',
                variant: 'destructive'
              })
            }
          }}>Export CSV</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeMembers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {((activeMembers / members.length) * 100).toFixed(1)}% retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredMembers}</div>
            <p className="text-xs text-muted-foreground">
              Need renewal
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({members.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeMembers})
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('expired')}
              >
                Expired ({expiredMembers})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({pendingMembers})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Member List ({filteredMembers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No members found matching your criteria</p>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map(member => (
                <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-lg">{member.name}</h3>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status.toUpperCase()}
                        </Badge>
                        <Badge className={`px-2 py-1 text-xs font-semibold rounded-full ${getExpiryWarning(member.expiryDate).color}`}>
                          <span className="mr-1">{getExpiryWarning(member.expiryDate).icon}</span>
                          {getExpiryWarning(member.expiryDate).text}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Expires: {format(parseISO(member.expiryDate), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="mr-4">Membership: {member.membershipType} ({formatINR(getMembershipPrice(member.membershipType))})</span>
                        <span className="mr-4">Total Visits: {member.totalVisits}</span>
                        {member.lastVisit && (
                          <span>Last Visit: {format(parseISO(member.lastVisit), 'dd MMM yyyy HH:mm')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.status === 'expired' && (
                        <Button
                          size="sm"
                          onClick={() => renewMembership(member.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Renew
                        </Button>
                      )}
                      {(isOwner(user) || isSemiAdmin(user)) && (
                        <>
                          <Link to={`/edit-member/${member.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                                                  <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Members
