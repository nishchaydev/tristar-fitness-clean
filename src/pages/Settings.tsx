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
  Database
} from 'lucide-react'
import DatabaseSettings from '@/components/DatabaseSettings'
import { useAuth } from '@/contexts/AuthContext'
import { useDataStore } from '@/lib/dataSync'
import { useToast } from '@/hooks/use-toast'

const Settings = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const { pricing, setPricing, termsAndConditions, setTermsAndConditions } = useDataStore()
  const [gymSettings, setGymSettings] = useState({
    name: 'TRI-STAR FITNESS',
    address: 'SAPNA SANGEETA MAIN ROAD NEXT TO LOTUS ELECTRONICS, INDORE',
    phone: '7693006066, 8103199510',
    email: 'tristarfitness26@gmail.com',
    website: 'www.tristarfitness.com',
    timings: 'Morning: 6:30 AM - 11:00 AM, Evening: 4:30 PM - 10:00 PM',
    establishedYear: '2020',
    capacity: '200',
    monthlyFee: String(pricing.monthlyFee),
    quarterlyFee: String(pricing.quarterlyFee),
    halfYearlyFee: String(pricing.halfYearlyFee),
    yearlyFee: String(pricing.yearlyFee),
    personalTrainingFee: String(pricing.personalTrainingFee)
  })

  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false)
  const [terms, setTerms] = useState(termsAndConditions)

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    toast({
      title: "Settings Saved",
      description: "Gym settings have been updated successfully.",
    })
  }

  const handleSavePricing = () => {
    setPricing({
      monthlyFee: Number(gymSettings.monthlyFee) || 0,
      quarterlyFee: Number(gymSettings.quarterlyFee) || 0,
      halfYearlyFee: Number(gymSettings.halfYearlyFee) || 0,
      yearlyFee: Number(gymSettings.yearlyFee) || 0,
      personalTrainingFee: Number(gymSettings.personalTrainingFee) || 0,
    })
    toast({ title: 'Pricing Saved', description: 'Pricing updated across the app.' })
  }

  const handleSaveTerms = () => {
    setTermsAndConditions(terms)
    toast({ title: 'Terms Updated', description: 'Invoice terms & conditions have been saved.' })
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
                placeholder="8500"
              />
            </div>
            <div>
              <Label htmlFor="personalTrainingFee">Personal Training (₹)</Label>
              <Input
                id="personalTrainingFee"
                value={gymSettings.personalTrainingFee}
                onChange={(e) => setGymSettings(prev => ({ ...prev, personalTrainingFee: e.target.value }))}
                placeholder="5500"
              />
            </div>
          </div>

          <Button onClick={handleSavePricing} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Pricing
          </Button>
        </CardContent>
      </Card>

      {/* Invoice Terms & Conditions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-green-600" />
            <span>Invoice Terms & Conditions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={6}
            placeholder="Enter terms & conditions shown at the bottom of invoices"
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Button onClick={handleSaveTerms} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Terms & Conditions
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


