import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserCog, Clock, LogOut, MapPin, Calendar, Users, TrendingUp, Plus, Edit, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { isOwner } from '@/lib/auth'
import { useDataStore } from '@/lib/dataSync'

interface Trainer {
  id: string
  name: string
  phone: string
  email: string
  specialization: string
  checkInTime?: string
  checkOutTime?: string
  status: 'available' | 'busy' | 'offline'
  currentSessions: number
  totalSessions: number
  joinDate: string
  salary: number
}

interface Session {
  id: string
  trainerId: string
  trainerName: string
  memberName: string
  startTime: string
  endTime?: string
  type: 'personal' | 'group' | 'consultation'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

const Trainers = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Get synchronized data from the store
  const { 
    trainers, 
    sessions, 
    addTrainer, 
    updateTrainer, 
    deleteTrainer,
    addSession,
    updateSession,
    getSessionsByTrainer,
    getMembersByTrainer
  } = useDataStore()
  
  // Filter data based on user role - trainers can only see their own data
  const filteredTrainers = isOwner(user) 
    ? trainers 
    : trainers.filter(t => {
        // Match by username or by name
        if (user?.username === 'yash' && t.name === 'Yash') return true
        if (user?.username === 'mohit' && t.name === 'Mohit Sen') return true
        if (user?.username === 'palak' && t.name === 'Palak Dubey') return true
        if (user?.username === 'nikhil') return true
        return t.name === user?.name
      })
  
  const filteredSessions = isOwner(user)
    ? sessions
    : sessions.filter(s => {
        // Match by username or by name
        if (user?.username === 'yash' && s.trainerName === 'Yash') return true
        if (user?.username === 'mohit' && s.trainerName === 'Mohit Sen') return true
        if (user?.username === 'palak' && s.trainerName === 'Palak Dubey') return true
        if (user?.username === 'nikhil') return true
        return s.trainerName === user?.name
      })

  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState('')
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showAddTrainerForm, setShowAddTrainerForm] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)
  
  const [sessionData, setSessionData] = useState({
    trainerId: '',
    memberName: '',
    startTime: '',
    type: 'personal' as const
  })

  const [trainerData, setTrainerData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    salary: 0
  })

  const specializations = [
    'Weight Training',
    'Yoga & Pilates',
    'Cardio & HIIT',
    'CrossFit',
    'Zumba',
    'Boxing',
    'Swimming',
    'General Fitness'
  ]

  const checkInTrainer = (trainerId: string) => {
    updateTrainer(trainerId, {
      checkInTime: new Date().toISOString(),
      status: 'available' as const
    })
    
    const trainer = trainers.find(t => t.id === trainerId)
    if (trainer) {
      toast({
        title: "Success",
        description: `${trainer.name} checked in successfully`,
      })
    }
  }

  const checkOutTrainer = (trainerId: string) => {
    updateTrainer(trainerId, {
      checkOutTime: new Date().toISOString(),
      status: 'offline' as const
    })
    
    const trainer = trainers.find(t => t.id === trainerId)
    if (trainer) {
      toast({
        title: "Success",
        description: `${trainer.name} checked out successfully`,
      })
    }
  }

  const handleAddTrainer = () => {
    if (!trainerData.name || !trainerData.email || !trainerData.phone || !trainerData.specialization) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const newTrainer: Omit<Trainer, 'id'> = {
      name: trainerData.name,
      email: trainerData.email,
      phone: trainerData.phone,
      specialization: trainerData.specialization,
      status: 'available',
      currentSessions: 0,
      totalSessions: 0,
      joinDate: new Date().toISOString().split('T')[0],
      salary: trainerData.salary
    }

    addTrainer(newTrainer)
    setTrainerData({ name: '', email: '', phone: '', specialization: '', salary: 0 })
    setShowAddTrainerForm(false)
    
    toast({
      title: "Success",
      description: `Trainer ${newTrainer.name} added successfully`,
    })
  }

  const editTrainer = () => {
    if (!editingTrainer) return

    if (!trainerData.name || !trainerData.email || !trainerData.phone || !trainerData.specialization) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    updateTrainer(editingTrainer.id, {
      name: trainerData.name,
      email: trainerData.email,
      phone: trainerData.phone,
      specialization: trainerData.specialization,
      salary: trainerData.salary
    })

    setEditingTrainer(null)
    setTrainerData({ name: '', email: '', phone: '', specialization: '', salary: 0 })
    
    toast({
      title: "Success",
      description: `Trainer ${trainerData.name} updated successfully`,
    })
  }

  const removeTrainer = (trainerId: string) => {
    const trainer = trainers.find(t => t.id === trainerId)
    if (trainer && trainer.currentSessions > 0) {
      toast({
        title: "Error",
        description: "Cannot remove trainer with active sessions",
        variant: "destructive"
      })
      return
    }

    if (trainer) {
      deleteTrainer(trainerId)
      toast({
        title: "Success",
        description: `${trainer.name} has been removed from the system.`,
      })
    }
  }

  const startEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer)
    setTrainerData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      salary: trainer.salary
    })
  }

  const cancelEdit = () => {
    setEditingTrainer(null)
    setTrainerData({ name: '', email: '', phone: '', specialization: '', salary: 0 })
  }

  const handleAddSession = () => {
    if (!sessionData.trainerId || !sessionData.memberName || !sessionData.startTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const trainer = trainers.find(t => t.id === sessionData.trainerId)
    if (!trainer) return

    const newSession: Omit<Session, 'id'> = {
      trainerId: sessionData.trainerId,
      trainerName: trainer.name,
      memberName: sessionData.memberName,
      startTime: sessionData.startTime,
      type: sessionData.type,
      status: 'scheduled'
    }

    addSession(newSession)
    
    // Update trainer status and session count
    updateTrainer(sessionData.trainerId, { 
      status: 'busy' as const, 
      currentSessions: trainer.currentSessions + 1 
    })

    setSessionData({ trainerId: '', memberName: '', startTime: '', type: 'personal' })
    setShowSessionForm(false)
    
    toast({
      title: "Success",
      description: `Session scheduled with ${trainer.name}`,
    })
  }

  const startSession = (sessionId: string) => {
    updateSession(sessionId, { status: 'in-progress' as const })
    
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      toast({
        title: "Session Started",
        description: `Session with ${session.memberName} has begun`,
      })
    }
  }

  const completeSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    updateSession(sessionId, { 
      status: 'completed' as const, 
      endTime: new Date().toISOString() 
    })

    // Update trainer status and session count
    const trainer = trainers.find(t => t.id === session.trainerId)
    if (trainer) {
      const newStatus = trainer.currentSessions > 1 ? 'busy' as const : 'available' as const
      updateTrainer(session.trainerId, { 
        status: newStatus,
        currentSessions: Math.max(0, trainer.currentSessions - 1),
        totalSessions: trainer.totalSessions + 1
      })
    }
    
    toast({
      title: "Session Completed",
      description: `Session with ${session.memberName} completed successfully`,
    })
  }

  const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const remainingMins = diffMins % 60
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`
    }
    return `${diffMins}m`
  }

  const availableTrainers = filteredTrainers.filter(t => t.status === 'available')
  const busyTrainers = filteredTrainers.filter(t => t.status === 'busy')
  const offlineTrainers = filteredTrainers.filter(t => t.status === 'offline')
  const activeSessions = filteredSessions.filter(s => s.status === 'in-progress')
  const scheduledSessions = filteredSessions.filter(s => s.status === 'scheduled')

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> User: {user?.username} ({user?.name}) | 
            Total Trainers: {trainers.length} | 
            Filtered Trainers: {filteredTrainers.length} | 
            Total Sessions: {sessions.length} | 
            Filtered Sessions: {filteredSessions.length}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trainers</h1>
          <p className="text-gray-600">Manage trainer schedules and check-ins</p>
        </div>
        <div className="flex space-x-2">
          {isOwner(user) && (
            <>
              <Button 
                variant="outline"
                onClick={() => setShowAddTrainerForm(!showAddTrainerForm)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {showAddTrainerForm ? 'Cancel' : 'Add Trainer'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowSessionForm(!showSessionForm)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {showSessionForm ? 'Cancel' : 'Schedule Session'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
            <UserCog className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTrainers.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableTrainers.length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {scheduledSessions.length} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTrainers.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTrainers.reduce((sum, t) => sum + t.totalSessions, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Completed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Trainer Form - Owner Only */}
      {showAddTrainerForm && isOwner(user) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainerName">Full Name *</Label>
                <Input
                  id="trainerName"
                  value={trainerData.name}
                  onChange={(e) => setTrainerData({...trainerData, name: e.target.value})}
                  placeholder="Enter trainer's full name"
                />
              </div>
              <div>
                <Label htmlFor="trainerEmail">Email *</Label>
                <Input
                  id="trainerEmail"
                  type="email"
                  value={trainerData.email}
                  onChange={(e) => setTrainerData({...trainerData, email: e.target.value})}
                  placeholder="trainer@tristarfitness.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="trainerPhone">Phone *</Label>
                <Input
                  id="trainerPhone"
                  value={trainerData.phone}
                  onChange={(e) => setTrainerData({...trainerData, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="trainerSpecialization">Specialization *</Label>
                <Select value={trainerData.specialization} onValueChange={(value) => setTrainerData({...trainerData, specialization: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trainerSalary">Monthly Salary (₹)</Label>
                <Input
                  id="trainerSalary"
                  type="number"
                  min="0"
                  value={trainerData.salary}
                  onChange={(e) => setTrainerData({...trainerData, salary: parseInt(e.target.value) || 0})}
                  placeholder="25000"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={editingTrainer ? editTrainer : handleAddTrainer}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
              </Button>
              {editingTrainer && (
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Scheduling Form - Owner Only */}
      {showSessionForm && isOwner(user) && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="trainer">Select Trainer</Label>
                <Select value={sessionData.trainerId} onValueChange={(value) => setSessionData({...sessionData, trainerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrainers.map(trainer => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="memberName">Member Name</Label>
                <Input
                  id="memberName"
                  value={sessionData.memberName}
                  onChange={(e) => setSessionData({...sessionData, memberName: e.target.value})}
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={sessionData.startTime}
                  onChange={(e) => setSessionData({...sessionData, startTime: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Session Type</Label>
                <Select value={sessionData.type} onValueChange={(value: 'personal' | 'group' | 'consultation') => setSessionData({...sessionData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Training</SelectItem>
                    <SelectItem value="group">Group Class</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleAddSession}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!sessionData.trainerId || !sessionData.memberName || !sessionData.startTime}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Trainers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Available Trainers ({availableTrainers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableTrainers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No trainers currently available</p>
          ) : (
            <div className="space-y-4">
              {availableTrainers.map(trainer => (
                <div key={trainer.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{trainer.name}</h3>
                      <p className="text-sm text-gray-600">{trainer.specialization}</p>
                      <p className="text-xs text-gray-500">{trainer.email}</p>
                      <p className="text-xs text-blue-600">
                        Sessions today: {trainer.totalSessions} | Salary: ₹{trainer.salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOwner(user) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditTrainer(trainer)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTrainer(trainer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
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

      {/* Busy Trainers */}
      {busyTrainers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Currently Busy ({busyTrainers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {busyTrainers.map(trainer => (
                <div key={trainer.id} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{trainer.name}</h3>
                      <p className="text-sm text-gray-600">{trainer.specialization}</p>
                      <p className="text-xs text-gray-500">{trainer.email}</p>
                      <p className="text-xs text-orange-600">
                        Active sessions: {trainer.currentSessions} | Salary: ₹{trainer.salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOwner(user) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditTrainer(trainer)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTrainer(trainer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Active Sessions ({activeSessions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{session.trainerName}</h3>
                      <p className="text-sm text-gray-600">Training: {session.memberName}</p>
                      <p className="text-xs text-gray-500">Type: {session.type}</p>
                      <p className="text-xs text-green-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Duration: {getDuration(session.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => completeSession(session.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Sessions */}
      {scheduledSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Scheduled Sessions ({scheduledSessions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledSessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{session.trainerName}</h3>
                      <p className="text-sm text-gray-600">Training: {session.memberName}</p>
                      <p className="text-xs text-gray-500">Type: {session.type}</p>
                      <p className="text-xs text-blue-600">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Start: {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startSession(session.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Start Session
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Trainers
