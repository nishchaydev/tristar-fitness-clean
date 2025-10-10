import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatINR } from '@/lib/utils'
import { useDataStore } from '@/lib/dataSync'

const AddMember = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addMember, pricing } = useDataStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipStartDate: '',
    membershipType: 'monthly' as 'monthly' | 'quarterly' | 'annual'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Form submitted with data:', formData)
      
      // Calculate expiry date based on start date and duration
      const startDate = new Date(formData.membershipStartDate)
      const expiryDate = new Date(startDate)
      
      switch (formData.membershipType) {
        case 'monthly':
          expiryDate.setMonth(expiryDate.getMonth() + 1)
          break
        case 'quarterly':
          expiryDate.setMonth(expiryDate.getMonth() + 3)
          break
        case 'annual':
          expiryDate.setFullYear(expiryDate.getFullYear() + 1)
          break
      }
      
      const newMember = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        membershipType: formData.membershipType,
        startDate: formData.membershipStartDate,
        expiryDate: expiryDate.toISOString().split('T')[0],
        // New members start as pending until payment is received
        status: 'pending' as const,
        lastVisit: undefined,
        totalVisits: 0
      }
      
      console.log('Adding new member:', newMember)
      addMember(newMember)
      
      // Verify the member was added
      console.log('Member added successfully')
      
      toast({
        title: "Success!",
        description: `${newMember.name} has been added successfully.`,
      })
      
      // Navigate to members page
      navigate('/members')
    } catch (error) {
      console.error('Error adding member:', error)
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/members">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Member</h1>
            <p className="text-gray-600 dark:text-gray-400">Register a new gym member</p>
          </div>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-green-600" />
            <span>New Member Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span>Full Name *</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Mail className="h-4 w-4" />
                  <span>Email Address *</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number *</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Membership Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Membership Start Date *</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.membershipStartDate}
                  onChange={(e) => handleInputChange('membershipStartDate', e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Membership Duration */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="duration" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>Membership Duration *</span>
                </Label>
                <select
                  id="duration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.membershipType}
                  onChange={(e) => handleInputChange('membershipType', e.target.value)}
                  required
                >
                  <option value="monthly">1 Month - {formatINR(pricing.monthlyFee)}</option>
                  <option value="quarterly">3 Months - {formatINR(pricing.quarterlyFee)}</option>
                  <option value="annual">1 Year - {formatINR(pricing.yearlyFee)}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link to="/members">
                <Button type="button" variant="outline" className="hover:scale-105 transition-transform duration-200">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddMember
