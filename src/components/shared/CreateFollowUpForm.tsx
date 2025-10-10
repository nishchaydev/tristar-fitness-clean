import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useDataStore } from '@/lib/dataSync';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { VisitorFollowUpFields } from './VisitorFollowUpFields';
import { validateFormData, sanitizeFormData } from '@/lib/utils/sanitize';

interface CreateFollowUpFormProps {
  onClose: () => void;
}

const followUpCategories = [
  { value: 'member', label: 'Member Related' },
  { value: 'visitor', label: 'Visitor & Inquiries' },
  { value: 'facility', label: 'Facility Management' },
  { value: 'staff', label: 'Staff Related' },
  { value: 'equipment', label: 'Equipment & Maintenance' },
  { value: 'marketing', label: 'Marketing & Events' },
  { value: 'general', label: 'General Tasks' }
];

const followUpTypes = {
  member: [
    { value: 'membership_renewal', label: 'Membership Renewal' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'visit_reminder', label: 'Visit Reminder' },
    { value: 'complaint', label: 'Member Complaint' },
    { value: 'inquiry', label: 'Member Inquiry' }
  ],
  visitor: [
    { value: 'membership_inquiry', label: 'Membership Inquiry' },
    { value: 'trial_request', label: 'Trial Session Request' },
    { value: 'price_inquiry', label: 'Pricing Inquiry' },
    { value: 'facility_tour', label: 'Facility Tour Request' },
    { value: 'callback_request', label: 'Callback Request' },
    { value: 'general_inquiry', label: 'General Inquiry' }
  ],
  facility: [
    { value: 'maintenance', label: 'Maintenance Request' },
    { value: 'repair', label: 'Repair Work' },
    { value: 'cleaning', label: 'Cleaning Schedule' },
    { value: 'renovation', label: 'Renovation Task' }
  ],
  staff: [
    { value: 'training', label: 'Staff Training' },
    { value: 'schedule', label: 'Schedule Management' },
    { value: 'performance', label: 'Performance Review' },
    { value: 'complaint', label: 'Staff Complaint' }
  ],
  equipment: [
    { value: 'maintenance', label: 'Equipment Maintenance' },
    { value: 'repair', label: 'Equipment Repair' },
    { value: 'inspection', label: 'Safety Inspection' },
    { value: 'inventory', label: 'Inventory Check' }
  ],
  marketing: [
    { value: 'event', label: 'Event Planning' },
    { value: 'promotion', label: 'Promotion Campaign' },
    { value: 'social_media', label: 'Social Media Task' },
    { value: 'advertisement', label: 'Advertisement' }
  ],
  general: [
    { value: 'general', label: 'General Task' },
    { value: 'other', label: 'Other' }
  ]
};

export const CreateFollowUpForm: React.FC<CreateFollowUpFormProps> = ({ onClose }) => {
  const { members, addFollowUp } = useDataStore();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    type: '',
    memberId: '',
    contactInfo: {
      name: '',
      phone: '',
      email: '',
    },
    notes: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as const,
    estimatedCost: '',
    assignedTo: '',  // Will be set in useEffect
    tags: [] as string[],
    source: undefined as 'walk-in' | 'phone' | 'email' | 'website' | 'social_media' | undefined,
    preferredContactMethod: undefined as 'phone' | 'email' | 'whatsapp' | undefined,
    bestTimeToContact: '',
    conversionStatus: 'new' as const
  });

  // Set assignedTo when user context is available
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, assignedTo: user.id }));
    }
  }, [user?.id]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      const requiredFields = {
        'Category': formData.category,
        'Type': formData.type,
        'Description': formData.notes,
        'Due Date': formData.dueDate
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([field]) => field);

      if (missingFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in the following fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Validate visitor-specific fields
      if (formData.category === 'visitor') {
        if (!formData.source) {
          toast({
            title: "Required Fields Missing",
            description: "Please select the source of the visitor inquiry",
            variant: "destructive"
          });
          return;
        }

        // Validate contact method requirements
        const formErrors = validateFormData(formData);
        if (formErrors.length > 0) {
          toast({
            title: "Validation Error",
            description: formErrors.join('\n'),
            variant: "destructive"
          });
          return;
        }
      }

      // Get member details if memberId is provided
      const member = formData.memberId ? members.find(m => m.id === formData.memberId) : null;

      // Sanitize user input
      const sanitizedData = sanitizeFormData(formData);

      // Construct the follow-up object
      const newFollowUp = {
        // Basic task information
        category: sanitizedData.category as any,
        type: sanitizedData.type as any,
        status: 'pending' as const,
        dueDate: sanitizedData.dueDate,
        notes: sanitizedData.notes,
        priority: sanitizedData.priority,

        // Member information (if applicable)
        memberId: sanitizedData.memberId || undefined,
        memberName: member?.name,

        // Contact information
        contactInfo: sanitizedData.contactInfo,

        // Task metadata
        assignedTo: sanitizedData.assignedTo || undefined,
        estimatedCost: sanitizedData.estimatedCost ? parseFloat(sanitizedData.estimatedCost) : undefined,
        tags: sanitizedData.tags,
        createdBy: user?.id,

        // Visitor-specific fields (only included if category is visitor)
        ...(sanitizedData.category === 'visitor' && {
          source: sanitizedData.source,
          preferredContactMethod: sanitizedData.preferredContactMethod,
          bestTimeToContact: sanitizedData.bestTimeToContact,
          conversionStatus: sanitizedData.conversionStatus
        })
      };

      await addFollowUp(newFollowUp);
      toast({
        title: "Success",
        description: "New follow-up task created successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error creating follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to create follow-up. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      type: '',
      memberId: category === 'member' ? prev.memberId : ''
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl sm:text-2xl">Create New Follow-up Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Category and Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {followUpCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              disabled={!formData.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {formData.category && followUpTypes[formData.category as keyof typeof followUpTypes]?.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Member Selection (if applicable) */}
        {formData.category === 'member' && (
          <div className="space-y-2">
            <Label htmlFor="member">Select Member</Label>
            <Select 
              value={formData.memberId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.membershipType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Visitor Fields */}
        {formData.category === 'visitor' && (
          <VisitorFollowUpFields formData={formData} setFormData={setFormData} />
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input
              value={formData.contactInfo.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, name: e.target.value }
              }))}
              placeholder="Contact person's name"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input
              value={formData.contactInfo.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, phone: e.target.value }
              }))}
              placeholder="Contact phone number"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              value={formData.contactInfo.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, email: e.target.value }
              }))}
              placeholder="Contact email"
              type="email"
            />
          </div>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estimated Cost (if any)</Label>
            <Input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <Label htmlFor="notes">Description/Notes *</Label>
          <Textarea
            id="notes"
            placeholder="Enter detailed description of the task or follow-up..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />
        </div>

        {/* Tags Input */}
        <div className="space-y-2">
          <Label>Tags (comma-separated)</Label>
          <Input
            placeholder="Enter tags..."
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
          <Button 
            onClick={handleSubmit} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Follow-up
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};