import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  Save,
  X,
  Users
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useDataStore } from '@/lib/dataSync'

const VisitorDetailsWidget = () => {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [visitorData, setVisitorData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: '',
    notes: '',
    followUpDate: '',
    followUpNotes: ''
  })

  const { addFollowUp, addActivity } = useDataStore()

  const handleInputChange = (field: string, value: string) => {
    setVisitorData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveVisitor = () => {
    if (!visitorData.name || !visitorData.phone) {
      toast({
        title: "Missing Information",
        description: "Name and phone number are required.",
        variant: "destructive"
      })
      return
    }

    // Create follow-up for visitor
    const followUpData = {
      memberId: `visitor-${Date.now()}`, // Temporary ID for visitors
      memberName: visitorData.name,
      type: 'visit_reminder' as const,
      status: 'pending' as const,
      dueDate: visitorData.followUpDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to tomorrow
      notes: `Visitor: ${visitorData.name} | Purpose: ${visitorData.purpose} | Phone: ${visitorData.phone} | Email: ${visitorData.email || 'N/A'} | Notes: ${visitorData.notes} | Follow-up Notes: ${visitorData.followUpNotes}`,
      createdAt: new Date().toISOString()
    }

    addFollowUp(followUpData)

    // Add activity
    addActivity({
      type: 'followup',
      action: 'Visitor follow-up created',
      name: visitorData.name,
      time: new Date().toISOString(),
      details: `Visitor follow-up created for ${visitorData.purpose}`,
      memberId: followUpData.memberId
    })

    toast({
      title: "Visitor Details Saved",
      description: `Follow-up created for ${visitorData.name}. You can manage it in the Follow-ups section.`,
    })

    // Reset form
    setVisitorData({
      name: '',
      phone: '',
      email: '',
      purpose: '',
      notes: '',
      followUpDate: '',
      followUpNotes: ''
    })
    setIsOpen(false)
  }

  const handleCancel = () => {
    setVisitorData({
      name: '',
      phone: '',
      email: '',
      purpose: '',
      notes: '',
      followUpDate: '',
      followUpNotes: ''
    })
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsOpen(true)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Visitor Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to add visitor information for follow-up</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          <span>Visitor Details & Follow-up</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={visitorData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Visitor's full name"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={visitorData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={visitorData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="visitor@email.com"
            />
          </div>
          <div>
            <Label htmlFor="purpose">Purpose of Visit</Label>
            <Input
              id="purpose"
              value={visitorData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              placeholder="Gym tour, membership inquiry, etc."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Visit Notes</Label>
          <Textarea
            id="notes"
            value={visitorData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes about the visit..."
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span>Follow-up Information</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={visitorData.followUpDate}
                onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="followUpNotes">Follow-up Notes</Label>
              <Textarea
                id="followUpNotes"
                value={visitorData.followUpNotes}
                onChange={(e) => handleInputChange('followUpNotes', e.target.value)}
                placeholder="Notes for follow-up call..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSaveVisitor} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save & Create Follow-up
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default VisitorDetailsWidget