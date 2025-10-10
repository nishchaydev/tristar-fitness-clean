import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VisitorFollowUpFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const VisitorFollowUpFields: React.FC<VisitorFollowUpFieldsProps> = ({
  formData,
  setFormData
}) => {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source of Inquiry */}
        <div className="space-y-2">
          <Label>Source of Inquiry</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => handleChange('source', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="How did they contact us?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Contact Method */}
        <div className="space-y-2">
          <Label>Preferred Contact Method</Label>
          <Select
            value={formData.preferredContactMethod}
            onValueChange={(value) => handleChange('preferredContactMethod', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Best Time to Contact */}
      <div className="space-y-2">
        <Label>Best Time to Contact</Label>
        <Input
          type="text"
          value={formData.bestTimeToContact}
          onChange={(e) => handleChange('bestTimeToContact', e.target.value)}
          placeholder="e.g., Weekdays after 6 PM"
        />
      </div>

      {/* Conversion Status */}
      <div className="space-y-2">
        <Label>Inquiry Status</Label>
        <Select
          value={formData.conversionStatus}
          onValueChange={(value) => handleChange('conversionStatus', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New Inquiry</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="trial_scheduled">Trial Scheduled</SelectItem>
            <SelectItem value="trial_completed">Trial Completed</SelectItem>
            <SelectItem value="converted">Converted to Member</SelectItem>
            <SelectItem value="lost">Lost Opportunity</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};