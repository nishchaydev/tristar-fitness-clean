import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  trainer?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  memberId: string;
  memberName: string;
  type: 'payment_reminder' | 'membership_renewal' | 'visit_reminder' | 'general';
  status: 'pending' | 'completed' | 'cancelled';
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'member' | 'invoice' | 'followup' | 'checkin';
  action: string;
  name: string;
  time: string;
  details: string;
  memberId?: string;
}

export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  date: string;
}

// Store interface
interface DataStore {
  // State
  members: Member[];
  invoices: Invoice[];
  followUps: FollowUp[];
  activities: Activity[];
  checkIns: CheckIn[];
  
  // Member actions
  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  
  // Follow-up actions
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  getFollowUp: (id: string) => FollowUp | undefined;
  
  // Activity actions
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  getActivities: () => Activity[];
  
  // Check-in actions
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  getCheckIns: (date?: string) => CheckIn[];
  getMemberCheckIns: (memberId: string) => CheckIn[];
  
  // Utility actions
  clearAllData: () => void;
  exportData: () => string;
  importData: (data: string) => void;
}

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Store implementation
export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      // Initial state
      members: [],
      invoices: [],
      followUps: [],
      activities: [],
      checkIns: [],

      // Member actions
      addMember: (memberData) => {
        const member: Member = {
          ...memberData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          members: [...state.members, member],
          activities: [...state.activities, {
            id: generateId(),
            type: 'member',
            action: 'Member added',
            name: member.name,
            time: new Date().toISOString(),
            details: `Added ${member.name} with ${member.membershipType} membership`,
            memberId: member.id,
          }],
        }));
      },
      
      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? { ...member, ...updates, updatedAt: new Date().toISOString() }
              : member
          ),
          activities: [...state.activities, {
            id: generateId(),
            type: 'member',
            action: 'Member updated',
            name: updates.name || state.members.find(m => m.id === id)?.name || 'Unknown',
            time: new Date().toISOString(),
            details: `Updated member information`,
            memberId: id,
          }],
        }));
      },
      
      deleteMember: (id) => {
        const member = get().members.find(m => m.id === id);
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
          invoices: state.invoices.filter((invoice) => invoice.memberId !== id),
          followUps: state.followUps.filter((followUp) => followUp.memberId !== id),
          activities: [...state.activities, {
            id: generateId(),
            type: 'member',
            action: 'Member deleted',
            name: member?.name || 'Unknown',
            time: new Date().toISOString(),
            details: `Deleted member ${member?.name}`,
            memberId: id,
          }],
        }));
      },
      
      getMember: (id) => {
        return get().members.find((member) => member.id === id);
      },

      // Invoice actions
      addInvoice: (invoiceData) => {
        const invoice: Invoice = {
          ...invoiceData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          invoices: [...state.invoices, invoice],
          activities: [...state.activities, {
            id: generateId(),
            type: 'invoice',
            action: 'Invoice created',
            name: invoice.memberName,
            time: new Date().toISOString(),
            details: `Created invoice for ${invoice.memberName} - ₹${invoice.amount}`,
            memberId: invoice.memberId,
          }],
        }));
      },
      
      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, ...updates } : invoice
          ),
          activities: [...state.activities, {
            id: generateId(),
            type: 'invoice',
            action: 'Invoice updated',
            name: updates.memberName || state.invoices.find(i => i.id === id)?.memberName || 'Unknown',
            time: new Date().toISOString(),
            details: `Updated invoice information`,
            memberId: state.invoices.find(i => i.id === id)?.memberId,
          }],
        }));
      },
      
      deleteInvoice: (id) => {
        const invoice = get().invoices.find(i => i.id === id);
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id),
          activities: [...state.activities, {
            id: generateId(),
            type: 'invoice',
            action: 'Invoice deleted',
            name: invoice?.memberName || 'Unknown',
            time: new Date().toISOString(),
            details: `Deleted invoice for ${invoice?.memberName}`,
            memberId: invoice?.memberId,
          }],
        }));
      },
      
      getInvoice: (id) => {
        return get().invoices.find((invoice) => invoice.id === id);
      },

      // Follow-up actions
      addFollowUp: (followUpData) => {
        const followUp: FollowUp = {
          ...followUpData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          followUps: [...state.followUps, followUp],
          activities: [...state.activities, {
            id: generateId(),
            type: 'followup',
            action: 'Follow-up created',
            name: followUp.memberName,
            time: new Date().toISOString(),
            details: `Created ${followUp.type} follow-up for ${followUp.memberName}`,
            memberId: followUp.memberId,
          }],
        }));
      },
      
      updateFollowUp: (id, updates) => {
        set((state) => ({
          followUps: state.followUps.map((followUp) =>
            followUp.id === id ? { ...followUp, ...updates } : followUp
          ),
          activities: [...state.activities, {
            id: generateId(),
            type: 'followup',
            action: 'Follow-up updated',
            name: updates.memberName || state.followUps.find(f => f.id === id)?.memberName || 'Unknown',
            time: new Date().toISOString(),
            details: `Updated follow-up information`,
            memberId: state.followUps.find(f => f.id === id)?.memberId,
          }],
        }));
      },
      
      deleteFollowUp: (id) => {
        const followUp = get().followUps.find(f => f.id === id);
        set((state) => ({
          followUps: state.followUps.filter((followUp) => followUp.id !== id),
          activities: [...state.activities, {
            id: generateId(),
            type: 'followup',
            action: 'Follow-up deleted',
            name: followUp?.memberName || 'Unknown',
            time: new Date().toISOString(),
            details: `Deleted follow-up for ${followUp?.memberName}`,
            memberId: followUp?.memberId,
          }],
        }));
      },
      
      getFollowUp: (id) => {
        return get().followUps.find((followUp) => followUp.id === id);
      },

      // Activity actions
      addActivity: (activityData) => {
        const activity: Activity = {
          ...activityData,
          id: generateId(),
        };
        
        set((state) => ({
          activities: [...state.activities, activity],
        }));
      },
      
      getActivities: () => {
        return get().activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      },
      
      // Check-in actions
      addCheckIn: (checkInData) => {
        const checkIn: CheckIn = {
          ...checkInData,
          id: generateId(),
        };
        
        set((state) => ({
          checkIns: [...state.checkIns, checkIn],
          activities: [...state.activities, {
            id: generateId(),
            type: 'checkin',
            action: 'Member checked in',
            name: checkIn.memberName,
            time: new Date().toISOString(),
            details: `${checkIn.memberName} checked in at ${new Date(checkIn.checkInTime).toLocaleTimeString()}`,
            memberId: checkIn.memberId,
          }],
        }));
      },
      
      getCheckIns: (date) => {
        const checkIns = get().checkIns;
        if (date) {
          return checkIns.filter(checkIn => checkIn.date === date);
        }
        return checkIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
      },
      
      getMemberCheckIns: (memberId) => {
        return get().checkIns
          .filter(checkIn => checkIn.memberId === memberId)
          .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
      },
      
      // Utility actions
      clearAllData: () => {
        set({
        members: [],
        invoices: [],
        followUps: [],
          activities: [],
          checkIns: [],
        });
      },
      
      exportData: () => {
        const state = get();
        return JSON.stringify({
          members: state.members,
          invoices: state.invoices,
          followUps: state.followUps,
          activities: state.activities,
          checkIns: state.checkIns,
        }, null, 2);
      },
      
      importData: (data) => {
        try {
          const parsedData = JSON.parse(data);
           set({
            members: parsedData.members || [],
            invoices: parsedData.invoices || [],
            followUps: parsedData.followUps || [],
            activities: parsedData.activities || [],
            checkIns: parsedData.checkIns || [],
          });
         } catch (error) {
          console.error('Failed to import data:', error);
        }
      },
    }),
    {
      name: 'tristar-fitness-storage',
      partialize: (state) => ({
        members: state.members,
        invoices: state.invoices,
        followUps: state.followUps,
        activities: state.activities,
        checkIns: state.checkIns,
      }),
    }
  )
);
