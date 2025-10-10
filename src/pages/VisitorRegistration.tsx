import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Dumbbell, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { useDataStore } from '@/lib/dataSync';

const VisitorRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addVisitor, addActivity } = useDataStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: '',
    expectedDuration: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purposes = [
    'Gym Tour',
    'Personal Training Session',
    'Equipment Demo',
    'Membership Inquiry',
    'General Visit',
    'Other'
  ];

  const durations = [
    '30 minutes',
    '1 hour',
    '2 hours',
    'Half day',
    'Full day'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate visitor ID
      const visitorId = `VIS-${Date.now()}`;
      
      // Create visitor object
      const visitor = {
        id: visitorId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        purpose: formData.purpose,
        expectedDuration: formData.expectedDuration,
        notes: formData.notes,
        checkInTime: new Date().toISOString(),
        status: 'checked-in' as const
      };

      // Add visitor to store
      addVisitor(visitor);

      // Add activity log
      addActivity({
        type: 'visitor',
        action: 'Visitor registered',
        name: `Visitor: ${formData.name}`,
        time: new Date().toISOString(),
        details: `Purpose: ${formData.purpose}, Duration: ${formData.expectedDuration}`,
        visitorId: visitorId
      });

      toast({
        title: "Registration Successful!",
        description: `Welcome to TriStar Fitness, ${formData.name}!`,
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        purpose: '',
        expectedDuration: '',
        notes: ''
      });

      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/landing');
      }, 2000);

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact staff for assistance.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tristar-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-lg flex items-center justify-center shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TriStar Fitness
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                  Visitor Registration
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/landing')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* QR Code Info */}
          <Card className="mb-8 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to TriStar Fitness!</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Please fill out the form below to register as a visitor
              </p>
            </CardHeader>
          </Card>

          {/* Registration Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-tristar-600" />
                Visitor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Purpose of Visit *
                  </Label>
                  <Select 
                    value={formData.purpose} 
                    onValueChange={(value) => handleInputChange('purpose', value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select purpose of visit" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expected Duration */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Expected Duration *
                  </Label>
                  <Select 
                    value={formData.expectedDuration} 
                    onValueChange={(value) => handleInputChange('expectedDuration', value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select expected duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information or special requirements..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-tristar-600 hover:bg-tristar-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Register as Visitor
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    What happens next?
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• You'll receive a confirmation of your registration</li>
                    <li>• Our staff will be notified of your visit</li>
                    <li>• You can proceed to the gym area</li>
                    <li>• Remember to check out when you leave</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistration;
