import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Save,
  Building,
  Clock,
  Users,
  DollarSign,
  Bell,
  Database
} from 'lucide-react'
import DatabaseSettings from '@/components/DatabaseSettings'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const Settings = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [gymSettings, setGymSettings] = useState({
    name: 'TriStar Fitness',
    address: 'SAPNA SANGEETA MAIN ROAD NEXT TO LOTUS ELECTRONICS, INDORE',
    phone: '+91 98765 43210',
    email: 'info@tristarfitness.com',
    website: 'www.tristarfitness.com',
    timings: '6:00 AM - 10:00 PM',
    establishedYear: '2020',
    capacity: '200',
    monthlyFee: '1000',
    quarterlyFee: '2500',
    halfYearlyFee: '4500',
    yearlyFee: '8000'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    membershipExpiryAlerts: true,
    paymentReminders: true,
    checkInNotifications: true,
    followUpReminders: true
  })

  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false)

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    toast({
      title: "Settings Saved",
      description: "Gym settings have been updated successfully.",
    })
  }

  const handleSaveNotifications = () => {
    // Here you would typically save to backend
    toast({
      title: "Notification Settings Saved",
      description: "Notification preferences have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-indigo-100 mt-2">Manage gym configuration and preferences</p>
      </div>

      {/* Gym Information */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Gym Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="gymName">Gym Name</Label>
              <Input
                id="gymName"
                value={gymSettings.name}
                onChange={(e) => setGymSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter gym name"
              />
            </div>
            <div>
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input
                id="establishedYear"
                value={gymSettings.establishedYear}
                onChange={(e) => setGymSettings(prev => ({ ...prev, establishedYear: e.target.value }))}
                placeholder="2020"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={gymSettings.address}
              onChange={(e) => setGymSettings(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter complete gym address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={gymSettings.phone}
                onChange={(e) => setGymSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={gymSettings.email}
                onChange={(e) => setGymSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@tristarfitness.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={gymSettings.website}
                onChange={(e) => setGymSettings(prev => ({ ...prev, website: e.target.value }))}
                placeholder="www.tristarfitness.com"
              />
            </div>
            <div>
              <Label htmlFor="timings">Operating Hours</Label>
              <Input
                id="timings"
                value={gymSettings.timings}
                onChange={(e) => setGymSettings(prev => ({ ...prev, timings: e.target.value }))}
                placeholder="6:00 AM - 10:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="capacity">Gym Capacity</Label>
              <Input
                id="capacity"
                value={gymSettings.capacity}
                onChange={(e) => setGymSettings(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="200"
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Gym Information
          </Button>
        </CardContent>
      </Card>

      {/* Membership Pricing */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Membership Pricing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>
              <Input
                id="monthlyFee"
                value={gymSettings.monthlyFee}
                onChange={(e) => setGymSettings(prev => ({ ...prev, monthlyFee: e.target.value }))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="quarterlyFee">Quarterly Fee (₹)</Label>
              <Input
                id="quarterlyFee"
                value={gymSettings.quarterlyFee}
                onChange={(e) => setGymSettings(prev => ({ ...prev, quarterlyFee: e.target.value }))}
                placeholder="2500"
              />
            </div>
            <div>
              <Label htmlFor="halfYearlyFee">Half Yearly Fee (₹)</Label>
              <Input
                id="halfYearlyFee"
                value={gymSettings.halfYearlyFee}
                onChange={(e) => setGymSettings(prev => ({ ...prev, halfYearlyFee: e.target.value }))}
                placeholder="4500"
              />
            </div>
            <div>
              <Label htmlFor="yearlyFee">Yearly Fee (₹)</Label>
              <Input
                id="yearlyFee"
                value={gymSettings.yearlyFee}
                onChange={(e) => setGymSettings(prev => ({ ...prev, yearlyFee: e.target.value }))}
                placeholder="8000"
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Pricing
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">SMS Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Membership Expiry Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when memberships are about to expire</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.membershipExpiryAlerts}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, membershipExpiryAlerts: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Payment Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send reminders for pending payments</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.paymentReminders}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, paymentReminders: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Check-in Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when members check in</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.checkInNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, checkInNotifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Follow-up Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remind about pending follow-ups</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.followUpReminders}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, followUpReminders: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} className="bg-orange-600 hover:bg-orange-700">
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <span>Database Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your local database, view database location, and export data for backup purposes.
            </p>
            <Button 
              onClick={() => setShowDatabaseSettings(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Open Database Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Application Version</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">v1.0.0</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Database Status</h3>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Connected
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">User Role</h3>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Settings Modal */}
      {showDatabaseSettings && (
        <DatabaseSettings onClose={() => setShowDatabaseSettings(false)} />
      )}
    </div>
  )
}

export default Settings


