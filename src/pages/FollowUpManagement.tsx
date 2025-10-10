import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateFollowUpForm } from '@/components/shared/CreateFollowUpForm'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react'
import { useDataStore } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'

const FollowUpManagement = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { followUps, members, updateFollowUp, addFollowUp, addActivity } = useDataStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [dateText, setDateText] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Filter follow-ups
  const filteredFollowUps = followUps.map(f => ({
    ...f,
    type: f.type === 'membership_expiry' ? 'membership_renewal' : f.type
  })).filter(followUp => {
    const matchesSearch = followUp.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         followUp.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || followUp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Sort by due date
  const sortedFollowUps = filteredFollowUps.sort((a, b) => {
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)
    return dateA.getTime() - dateB.getTime()
  })

  // Calculate statistics
  const stats = {
    total: followUps.length,
    pending: followUps.filter(f => f.status === 'pending').length,
    completed: followUps.filter(f => f.status === 'completed').length,
    overdue: followUps.filter(f => {
      const dueDate = new Date(f.dueDate)
      const today = startOfDay(new Date())
      return f.status === 'pending' && isBefore(dueDate, today)
    }).length
  }

  // Handle follow-up actions
  const handleStatusChange = (followUpId: string, newStatus: 'completed' | 'cancelled') => {
    const followUp = followUps.find(f => f.id === followUpId)
    if (!followUp) return

    updateFollowUp(followUpId, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    })

    // Add activity
    addActivity({
      type: 'followup',
      action: `Follow-up ${newStatus}`,
      name: followUp.memberName,
      time: new Date().toISOString(),
      details: `Follow-up ${newStatus} for ${followUp.type}`,
      memberId: followUp.memberId
    })

    toast({
      title: `Follow-up ${newStatus === 'completed' ? 'Completed' : 'Cancelled'}`,
      description: `Follow-up for ${followUp.memberName} has been ${newStatus}.`,
    })
  }

  // Handle notes editing
  const handleEditNotes = (followUpId: string, currentNotes: string) => {
    setEditingNotes(followUpId)
    setNotesText(currentNotes)
  }

  const handleSaveNotes = (followUpId: string) => {
    updateFollowUp(followUpId, { notes: notesText })
    setEditingNotes(null)
    setNotesText('')
    
    toast({
      title: "Notes Updated",
      description: "Follow-up notes have been updated successfully.",
    })
  }

  // Handle due date editing
  const handleEditDate = (followUpId: string, currentDueDate: string) => {
    setEditingDate(followUpId)
    setDateText(currentDueDate.split('T')[0] || currentDueDate)
  }

  const handleSaveDate = (followUpId: string) => {
    if (!dateText) return
    updateFollowUp(followUpId, { dueDate: dateText })
    setEditingDate(null)
    setDateText('')
    toast({ title: 'Follow-up Updated', description: 'Next follow-up date has been updated.' })
  }

  const handleCancelDate = () => {
    setEditingDate(null)
    setDateText('')
  }

  const handleCancelEdit = () => {
    setEditingNotes(null)
    setNotesText('')
  }

  // Get status color
  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (status === 'cancelled') return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    
    const due = new Date(dueDate)
    const today = startOfDay(new Date())
    if (isBefore(due, today)) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'membership_renewal': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'visit_reminder': return <MessageSquare className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Get membership expiry warning
  const getMembershipExpiryWarning = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return null

    const today = new Date()
    const expiry = new Date(member.expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: 'EXPIRED', color: 'text-red-600 bg-red-100', icon: '⚠️' }
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: 'text-red-600 bg-red-100', icon: '🚨' }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-orange-600 bg-orange-100', icon: '⚠️' }
    } else if (diffDays <= 30) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600 bg-yellow-100', icon: '⏰' }
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600 bg-green-100', icon: '✅' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Follow-up Management</h1>
            <p className="text-yellow-100 mt-2">Track and manage member follow-ups and tasks</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Follow-up
          </Button>
        </div>
      </div>

      {/* Create Follow-up Form Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CreateFollowUpForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Follow-ups</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">All follow-ups</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Finished tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.overdue}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by member name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {sortedFollowUps.map((followUp) => {
          const member = members.find(m => m.id === followUp.memberId)
          const isOverdue = followUp.status === 'pending' && isBefore(new Date(followUp.dueDate), startOfDay(new Date()))
          
          return (
            <Card key={followUp.id} className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
              isOverdue ? 'ring-2 ring-red-500' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(followUp.type)}
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {followUp.memberName}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {followUp.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(followUp.status, followUp.dueDate)}>
                      {followUp.status}
                    </Badge>
                    {isOverdue && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                    {getMembershipExpiryWarning(followUp.memberId) && (
                      <Badge className={`px-2 py-1 text-xs font-semibold rounded-full ${getMembershipExpiryWarning(followUp.memberId)?.color}`}>
                        <span className="mr-1">{getMembershipExpiryWarning(followUp.memberId)?.icon}</span>
                        {getMembershipExpiryWarning(followUp.memberId)?.text}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {format(parseISO(followUp.dueDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Contact</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {member?.phone || 'N/A'} | {member?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</p>
                    {followUp.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNotes(followUp.id, followUp.notes)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {editingNotes === followUp.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        rows={3}
                        placeholder="Add notes for this follow-up..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(followUp.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {followUp.notes || 'No notes available'}
                    </p>
                  )}
                </div>

                {followUp.status === 'pending' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      onClick={() => handleStatusChange(followUp.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    {editingDate === followUp.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={dateText}
                          onChange={(e) => setDateText(e.target.value)}
                          className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                        <Button size="sm" onClick={() => handleSaveDate(followUp.id)} className="bg-blue-600 hover:bg-blue-700">
                          <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelDate}>
                          <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleEditDate(followUp.id, followUp.dueDate)}
                      >
                        <Calendar className="h-4 w-4 mr-2" /> Update Next Date
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(followUp.id, 'cancelled')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}

                {followUp.status === 'completed' && followUp.completedAt && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed on: {format(parseISO(followUp.completedAt), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sortedFollowUps.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Follow-ups Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No follow-ups available at the moment.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FollowUpManagement


