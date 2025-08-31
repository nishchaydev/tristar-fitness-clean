import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, Calendar, Clock, User, MessageSquare, CheckCircle, AlertCircle, TrendingUp, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore } from '@/lib/dataSync';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

const FollowUp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    followUps, 
    members, 
    addFollowUp, 
    updateFollowUp 
  } = useDataStore();
  
  const [selectedFollowUp, setSelectedFollowUp] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'membership_expiry' as const,
    notes: '',
    dueDate: '',
    priority: 'medium' as const
  });

  const addNewFollowUp = () => {
    if (!formData.memberId || !formData.notes || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const member = members.find(m => m.id === formData.memberId);
    if (!member) {
      toast({
        title: "Error",
        description: "Selected member not found",
        variant: "destructive"
      });
      return;
    }

    const newFollowUp = {
      memberId: formData.memberId,
      memberName: member.name,
      type: formData.type,
      status: 'pending' as const,
      dueDate: formData.dueDate,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    addFollowUp(newFollowUp);
    
    // Reset form
    setFormData({
      memberId: '',
      type: 'membership_expiry',
      notes: '',
      dueDate: '',
      priority: 'medium'
    });
    setShowForm(false);

    toast({
      title: "Success",
      description: "New follow-up created successfully",
    });
  };

  const handleCall = (phone: string) => {
    // In a real app, this would integrate with phone system
    toast({
      title: "Call Initiated",
      description: `Calling ${phone}...`,
    });
    // For demo, open phone dialer
    window.open(`tel:${phone}`, '_blank');
  };

  const handleEmail = (email: string) => {
    // In a real app, this would open email client
    window.open(`mailto:${email}`, '_blank');
  };

  const handleFollowUpAction = (followUpId: string, action: 'complete' | 'snooze') => {
    const followUp = followUps.find(f => f.id === followUpId);
    if (!followUp) return;

    if (action === 'complete') {
      updateFollowUp(followUpId, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      toast({
        title: "Follow-up Completed",
        description: `Follow-up for ${followUp.memberName} marked as completed.`,
      });
    } else if (action === 'snooze') {
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 3); // Snooze for 3 days
      
      updateFollowUp(followUpId, {
        status: 'snoozed',
        dueDate: newDueDate.toISOString().split('T')[0]
      });

      toast({
        title: "Follow-up Snoozed",
        description: `Follow-up for ${followUp.memberName} snoozed for 3 days.`,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'snoozed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'membership_expiry': return <Calendar className="h-4 w-4" />;
      case 'payment_reminder': return <TrendingUp className="h-4 w-4" />;
      case 'visit_reminder': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredFollowUps = followUps.filter(followUp => {
    const matchesSearch = followUp.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         followUp.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || followUp.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = followUps.filter(f => f.status === 'pending').length;
  const inProgressCount = followUps.filter(f => f.status === 'in_progress').length;
  const completedCount = followUps.filter(f => f.status === 'completed').length;
  const totalCount = followUps.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Follow-up Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage member follow-ups</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Follow-up
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Follow-ups</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">Search</Label>
              <Input
                id="search"
                placeholder="Search by member name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="filter" className="text-gray-700 dark:text-gray-300">Status Filter</Label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Follow-up Form */}
      {showForm && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="border-b border-gray-200 dark:border-gray-600">
            <CardTitle className="text-gray-900 dark:text-white">Create New Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberId" className="text-gray-700 dark:text-gray-300">Member *</Label>
                <Select value={formData.memberId} onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <div>
                <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membership_expiry">Membership Expiry</SelectItem>
                    <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                    <SelectItem value="visit_reminder">Visit Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-gray-700 dark:text-gray-300">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="priority" className="text-gray-700 dark:text-gray-300">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes *</Label>
              <Textarea
                id="notes"
                placeholder="Enter follow-up details..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex space-x-2 mt-6">
              <Button onClick={addNewFollowUp} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Follow-up
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-ups List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="text-gray-900 dark:text-white">Follow-ups ({filteredFollowUps.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredFollowUps.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No follow-ups found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFollowUps.map((followUp) => {
                const member = members.find(m => m.id === followUp.memberId);
                return (
                  <div
                    key={followUp.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            {getTypeIcon(followUp.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{followUp.memberName}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(followUp.status)}>
                                {followUp.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(followUp.priority)}>
                                {followUp.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Type:</strong> {followUp.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Due Date:</strong> {format(parseISO(followUp.dueDate), 'MMM dd, yyyy')}
                          </div>
                          {member && (
                            <>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Phone:</strong> {member.phone}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Email:</strong> {member.email}
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          <strong>Notes:</strong> {followUp.notes}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {member && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCall(member.phone)}
                                className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/30 dark:hover:text-green-300 transition-all duration-200"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEmail(member.email)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all duration-200"
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {followUp.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleFollowUpAction(followUp.id, 'complete')}
                              className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFollowUpAction(followUp.id, 'snooze')}
                              className="hover:scale-105 transition-transform duration-200"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Snooze
                            </Button>
                          </>
                        )}
                        {followUp.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleFollowUpAction(followUp.id, 'complete')}
                            className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUp;
