import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { addMember } from '@/lib/memberData'
import { useToast } from '@/hooks/use-toast'
import { formatINR } from '@/lib/utils'

const AddMember = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipStartDate: '',
    membershipDuration: '1_month' as '1_month' | '3_months' | '1_year'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const newMember = addMember(formData)
      toast({
        title: "Success!",
        description: `${newMember.name} has been added successfully.`,
      })
      navigate('/members')
    } catch (error) {
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
            <h1 className="text-3xl font-bold text-gray-900">Add Member</h1>
            <p className="text-gray-600">Register a new gym member</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>New Member Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
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
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
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
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
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
                />
              </div>

              {/* Membership Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membership Start Date *</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.membershipStartDate}
                  onChange={(e) => handleInputChange('membershipStartDate', e.target.value)}
                  required
                />
              </div>

              {/* Membership Duration */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="duration" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Membership Duration *</span>
                </Label>
                <select
                  id="duration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.membershipDuration}
                  onChange={(e) => handleInputChange('membershipDuration', e.target.value)}
                  required
                >
                  <option value="1_month">1 Month - {formatINR(999)}</option>
                  <option value="3_months">3 Months - {formatINR(2499)}</option>
                  <option value="1_year">1 Year - {formatINR(8999)}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link to="/members">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
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
