import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Edit, Save, Key, Eye, EyeOff, ArrowLeft, Settings, Shield, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useNavigate, Link } from 'react-router-dom'

const Profile = () => {
  const { user, logout, updateUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    username: user?.username || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showTrainerForm, setShowTrainerForm] = useState(false)
  const [trainerFormData, setTrainerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'trainer' as 'trainer' | 'senior_trainer' | 'assistant_trainer'
  })

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      })
    }
  }, [user])

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      })
      return
    }

    // Update the user in context and localStorage
    const updatedUser = {
      ...user,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone
    }

    // Update in context
    if (updateUser) {
      updateUser(updatedUser)
    }

    // Update in localStorage
    localStorage.setItem('tristar_fitness_user', JSON.stringify(updatedUser))

    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully!",
    })
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    // In a real app, this would change the password via API
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully!",
    })
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const generateCredentials = () => {
    if (user?.role !== 'owner') {
      toast({
        title: "Access Denied",
        description: "Only owners can generate login credentials",
        variant: "destructive"
      })
      return
    }

    // Generate random credentials
    const newUsername = `trainer_${Math.random().toString(36).substr(2, 6)}`
    const newPassword = generateStrongPassword()
    
    setTrainerFormData(prev => ({
      ...prev,
      username: newUsername,
      password: newPassword
    }))
    setShowTrainerForm(true)
  }

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const regeneratePassword = () => {
    const newPassword = generateStrongPassword()
    setTrainerFormData(prev => ({ ...prev, password: newPassword }))
  }

  const copyCredentials = () => {
    const credentials = `Username: ${trainerFormData.username}\nPassword: ${trainerFormData.password}`
    navigator.clipboard.writeText(credentials).then(() => {
      toast({
        title: "Credentials Copied",
        description: "Login credentials copied to clipboard",
      })
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive"
      })
    })
  }

  const handleTrainerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTrainerFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTrainerRoleChange = (role: string) => {
    setTrainerFormData(prev => ({ ...prev, role: role as 'trainer' | 'senior_trainer' | 'assistant_trainer' }))
  }

  const createTrainer = () => {
    if (!trainerFormData.name || !trainerFormData.email || !trainerFormData.phone || !trainerFormData.username || !trainerFormData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // In a real app, this would create the trainer account via API
    toast({
      title: "Trainer Created Successfully",
      description: `Account created for ${trainerFormData.name} with username: ${trainerFormData.username}`,
    })

    // Show detailed success message
    setTimeout(() => {
      toast({
        title: "Account Details",
        description: `Username: ${trainerFormData.username} | Password: ${trainerFormData.password} | Role: ${trainerFormData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      })
    }, 1000)

    // Reset form and hide it
    setTrainerFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      role: 'trainer'
    })
    setShowTrainerForm(false)
  }

  const cancelTrainerCreation = () => {
    setShowTrainerForm(false)
    setTrainerFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      role: 'trainer'
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Management</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Manage your account settings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Role: {user.role}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <Card className="profile-section bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-600 space-y-2 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span>Profile Information</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="hover:bg-tristar-50 hover:text-tristar-700 hover:border-tristar-300 dark:hover:bg-tristar-900/30 dark:hover:text-tristar-300 transition-all duration-200 w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                    className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-300 font-medium">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    disabled
                    className="form-input bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                  />
                </div>
              </div>
                              {isEditing && (
                  <Button onClick={handleSaveProfile} className="btn-primary bg-tristar-600 hover:bg-tristar-700 hover:scale-105 transition-transform duration-200 w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="profile-section bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="border-b border-gray-200 dark:border-gray-600">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Key className="h-4 w-4 text-white" />
                </div>
                <span>Change Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div>
                <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300 font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="form-input pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword} className="btn-secondary bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform duration-200 w-full sm:w-auto">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Owner Features */}
          {user.role === 'owner' && (
            <Card className="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>Owner Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Trainer Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-green-700">Total Trainers</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">2</div>
                      <div className="text-sm text-blue-700">Active Today</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">1</div>
                      <div className="text-sm text-purple-700">Senior Trainers</div>
                    </div>
                  </div>

                  {!showTrainerForm ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Create New Trainer Account</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Create complete trainer accounts with personal details, login credentials, and role assignment.
                      </p>
                      <Button onClick={generateCredentials} className="btn-primary">
                        <Key className="h-4 w-4 mr-2" />
                        Create Trainer Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">New Trainer Details</h4>
                        <Button variant="outline" size="sm" onClick={cancelTrainerCreation}>
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="trainerName">Full Name *</Label>
                          <Input
                            id="trainerName"
                            name="name"
                            value={trainerFormData.name}
                            onChange={handleTrainerFormChange}
                            placeholder="Enter trainer's full name"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trainerEmail">Email *</Label>
                          <Input
                            id="trainerEmail"
                            name="email"
                            type="email"
                            value={trainerFormData.email}
                            onChange={handleTrainerFormChange}
                            placeholder="trainer@email.com"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="trainerPhone">Phone Number *</Label>
                          <Input
                            id="trainerPhone"
                            name="phone"
                            value={trainerFormData.phone}
                            onChange={handleTrainerFormChange}
                            placeholder="+91 98765 43210"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trainerRole">Role *</Label>
                          <Select value={trainerFormData.role} onValueChange={handleTrainerRoleChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trainer">Trainer</SelectItem>
                              <SelectItem value="senior_trainer">Senior Trainer</SelectItem>
                              <SelectItem value="assistant_trainer">Assistant Trainer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="trainerUsername">Username *</Label>
                          <Input
                            id="trainerUsername"
                            name="username"
                            value={trainerFormData.username}
                            onChange={handleTrainerFormChange}
                            placeholder="Unique username"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trainerPassword">Password *</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="trainerPassword"
                              name="password"
                              type="text"
                              value={trainerFormData.password}
                              onChange={handleTrainerFormChange}
                              placeholder="Secure password"
                              className="form-input flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={regeneratePassword}
                              className="px-3"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Click the key icon to generate a new secure password
                          </p>
                          {trainerFormData.password && (
                            <div className="mt-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600">Password Strength:</span>
                                <div className="flex space-x-1">
                                  {[...Array(4)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < Math.min(4, Math.floor(trainerFormData.password.length / 3))
                                          ? 'bg-green-500'
                                          : 'bg-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {trainerFormData.password.length >= 12 ? 'Strong' : 
                                   trainerFormData.password.length >= 8 ? 'Good' : 
                                   trainerFormData.password.length >= 6 ? 'Fair' : 'Weak'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">Account Preview</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={copyCredentials}
                            disabled={!trainerFormData.username || !trainerFormData.password}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            Copy Credentials
                          </Button>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p><strong>Name:</strong> {trainerFormData.name || 'Not specified'}</p>
                          <p><strong>Email:</strong> {trainerFormData.email || 'Not specified'}</p>
                          <p><strong>Phone:</strong> {trainerFormData.phone || 'Not specified'}</p>
                          <p><strong>Role:</strong> {trainerFormData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p><strong>Username:</strong> {trainerFormData.username || 'Not generated'}</p>
                          <p><strong>Password:</strong> {trainerFormData.password || 'Not generated'}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button onClick={createTrainer} className="btn-primary">
                          <Save className="h-4 w-4 mr-2" />
                          Create Trainer Account
                        </Button>
                        <Button variant="outline" onClick={cancelTrainerCreation}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing Trainers Management */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Manage Existing Trainers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Yash</p>
                          <p className="text-sm text-gray-600">yash@tristarfitness.com • Trainer</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Reset Password
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Mohit Sen</p>
                          <p className="text-sm text-gray-600">mohit@tristarfitness.com • Senior Trainer</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Reset Password
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Palak Dubey</p>
                          <p className="text-sm text-gray-600">palak@tristarfitness.com • Assistant Trainer</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Reset Password
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/trainers">
                        <Button variant="outline" className="w-full">
                          View All Trainers
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security & Privacy */}
          <Card className="profile-section">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Login Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="profile-section">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
