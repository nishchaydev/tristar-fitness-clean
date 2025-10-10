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
  expiryDate?: string;  // Added for compatibility
  status: 'active' | 'inactive' | 'expired';
  trainer?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalVisits?: number;
  lastVisit?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number; // kept for backward compatibility; equals total
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
  createdAt: string;
  // Extended fields
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  paidAmount?: number; // amount received
}

export interface FollowUp {
  id: string;
  memberId?: string;  // Optional for non-member follow-ups
  memberName?: string;
  visitorId?: string;  // Added for visitor follow-ups
  visitorName?: string;
  type: 'payment_reminder' | 'membership_renewal' | 'visit_reminder' | 'general' | 'membership_expiry' | 
        'inquiry' | 'maintenance' | 'complaint' | 'staff' | 'inventory' | 'marketing' | 'event' |
        'membership_inquiry' | 'trial_request' | 'price_inquiry' | 'facility_tour' | 'callback_request' | 'general_inquiry';
  category: 'member' | 'visitor' | 'facility' | 'staff' | 'equipment' | 'general' | 'marketing';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'snoozed';
  dueDate: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;  // Staff member responsible
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  relatedDocuments?: string[];
  tags?: string[];
  estimatedCost?: number;
  resolution?: string;
  source?: 'walk-in' | 'phone' | 'email' | 'website' | 'social_media';
  preferredContactMethod?: 'phone' | 'email' | 'whatsapp';
  bestTimeToContact?: string;
  followUpCount?: number;  // Track number of follow-up attempts
  lastContactAttempt?: string;
  conversionStatus?: 'new' | 'interested' | 'trial_scheduled' | 'trial_completed' | 'converted' | 'lost';
}

export interface Protein {
  id: string;
  name: string;
  basePrice: number;
  sellingPrice: number;
  quantityInStock: number;
  unitsSold: number;
  supplierName?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  // Calculated fields
  margin?: number;
  profit?: number;
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

export interface PricingSettings {
  monthlyFee: number;
  quarterlyFee: number;
  halfYearlyFee: number;
  yearlyFee: number;
  personalTrainingFee: number;
}

// Store interface
interface DataStore {
  // State
  members: Member[];
  trainers: any[];
  visitors: any[];
  invoices: Invoice[];
  followUps: FollowUp[];
  activities: Activity[];
  checkIns: CheckIn[];
  proteins: Protein[];
  pricing: PricingSettings;
  termsAndConditions: string;
  lastInvoiceSequence: number;
  
  // Demo data initialization
  initializeDemoData: () => void;
  
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
  
  // Protein actions
  addProtein: (protein: Omit<Protein, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProtein: (id: string, updates: Partial<Protein>) => void;
  deleteProtein: (id: string) => void;
  getProtein: (id: string) => Protein | undefined;
  recordProteinSale: (id: string, unitsSold: number) => void;
  
  // Activity actions
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  getActivities: () => Activity[];
  
  // Check-in actions
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  getCheckIns: (date?: string) => CheckIn[];
  getMemberCheckIns: (memberId: string) => CheckIn[];
  setPricing: (pricing: PricingSettings) => void;
  setTermsAndConditions: (terms: string) => void;
  getNextInvoiceId: () => string;
  
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
      trainers: [],
      visitors: [],
      invoices: [],
      followUps: [],
      activities: [],
      checkIns: [],
      proteins: [],
      pricing: {
        monthlyFee: 1999,
        quarterlyFee: 5500,
        halfYearlyFee: 6999,
        yearlyFee: 8500,
        personalTrainingFee: 5500,
      },
      termsAndConditions: `TRI-STAR FITNESS TERMS AND CONDITIONS\n\n• The TRI-STAR FITNESS allows the members to join the gym.\n• The membership is non-transferable, non-refundable, and cannot be shared with or assigned to any other person.\n• The Member promises to follow all the rules and conditions of the agreement and the program.\n• Respect other members' rights and follow the rules as per the agreement.\n• Not engaging in any activities like doping, Steroids, Smoking and alcohol that could harm the name and reputation of the gym. If any member is found doing such activities Tri-Star Fitness holds all the rights to cancel the membership of such members.\n• Outside shoes are strictly not allowed; all members need to carry extra shoes with them.\n• The Gym will be open from morning 6:30 till afternoon 11:00 and from 4:30 till 10:00 in the evening; members can plan their workout within the time frame.\n• Wearing inappropriate clothes is not allowed.\n• For any injury, physical or internal damages, TRI-STAR FITNESS does not hold any liabilities for the members.\n• Using the dumbbells and weights, members need to re-rack at the appropriate places.\n• Tri-Star Fitness holds all the rights to cancel the membership if proper rules and regulations are not followed by the member.\n\nHereby I agree to all the terms and conditions for enrolling for the membership.`,
      lastInvoiceSequence: 0,

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

      // Sweep to auto-expire members whose end/expiry date passed
      autoExpireMembers: () => {
        set((state) => ({
          members: state.members.map((member) => {
            const end = (member as any).endDate || (member as any).expiryDate
            if (!end) return member
            if (new Date(end) < new Date() && member.status === 'active') {
              return { ...member, status: 'expired', updatedAt: new Date().toISOString() }
            }
            return member
          })
        }))
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
          ...invoiceData as any,
          id: (invoiceData as any).id || get().getNextInvoiceId(),
          createdAt: new Date().toISOString(),
          amount: typeof (invoiceData as any).total === 'number' ? (invoiceData as any).total : (invoiceData as any).amount,
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

      // Protein actions
      addProtein: (proteinData) => {
        const protein: Protein = {
          ...proteinData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unitsSold: 0, // Initialize to 0
          margin: proteinData.sellingPrice - proteinData.basePrice,
          profit: 0, // Initialize to 0 since no units sold yet
        };
        
        set((state) => ({
          proteins: [...state.proteins, protein],
          activities: [...state.activities, {
            id: generateId(),
            type: 'member', // Using member type for now
            action: 'Protein product added',
            name: protein.name,
            time: new Date().toISOString(),
            details: `Added ${protein.name} to protein store`,
          }],
        }));
      },
      
      updateProtein: (id, updates) => {
        set((state) => ({
          proteins: state.proteins.map((protein) => {
            if (protein.id === id) {
              const updated = { ...protein, ...updates, updatedAt: new Date().toISOString() };
              updated.margin = updated.sellingPrice - updated.basePrice;
              updated.profit = updated.margin * updated.unitsSold;
              return updated;
            }
            return protein;
          }),
          activities: [...state.activities, {
            id: generateId(),
            type: 'member',
            action: 'Protein product updated',
            name: updates.name || get().proteins.find(p => p.id === id)?.name || 'Unknown',
            time: new Date().toISOString(),
            details: `Updated protein product details`,
          }],
        }));
      },
      
      deleteProtein: (id) => {
        const protein = get().proteins.find(p => p.id === id);
        set((state) => ({
          proteins: state.proteins.filter((protein) => protein.id !== id),
          activities: [...state.activities, {
            id: generateId(),
            type: 'member',
            action: 'Protein product deleted',
            name: protein?.name || 'Unknown',
            time: new Date().toISOString(),
            details: `Deleted protein product: ${protein?.name || 'Unknown'}`,
          }],
        }));
      },
      
      getProtein: (id) => {
        return get().proteins.find((protein) => protein.id === id);
      },
      
      recordProteinSale: (id, unitsSold) => {
        set((state) => ({
          proteins: state.proteins.map((protein) => {
            if (protein.id === id && protein.quantityInStock >= unitsSold) {
              const updated = {
                ...protein,
                unitsSold: protein.unitsSold + unitsSold,
                quantityInStock: protein.quantityInStock - unitsSold,
                updatedAt: new Date().toISOString(),
              };
              updated.profit = (updated.sellingPrice - updated.basePrice) * updated.unitsSold;
              return updated;
            }
            return protein;
          }),
          activities: [...state.activities, {
            id: generateId(),
            type: 'member',
            action: 'Protein sale recorded',
            name: get().proteins.find(p => p.id === id)?.name || 'Unknown',
            time: new Date().toISOString(),
            details: `Sold ${unitsSold} units of protein product`,
          }],
        }));
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
        
        set((state) => {
          // Update member's total visits
          const updatedMembers = state.members.map(member => {
            if (member.id === checkIn.memberId) {
              return {
                ...member,
                totalVisits: (member.totalVisits || 0) + 1,
                lastVisit: checkIn.checkInTime,
                updatedAt: new Date().toISOString()
              };
            }
            return member;
          });

          return {
            members: updatedMembers,
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
          };
        });
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
      setPricing: (pricing) => {
        set({ pricing });
      },
      setTermsAndConditions: (terms) => {
        set({ termsAndConditions: terms });
      },
      getNextInvoiceId: () => {
        // Prefer sequential #MP0001 format. Initialize from existing invoices if needed
        let current = get().lastInvoiceSequence || 0;
        if (current === 0) {
          const existing = get().invoices || [];
          const maxSeq = existing.reduce((max, inv) => {
            const match = typeof inv.id === 'string' && inv.id.startsWith('#MP') ? inv.id.replace('#MP', '') : null;
            const num = match ? parseInt(match, 10) : NaN;
            return Number.isFinite(num) && num > max ? num : max;
          }, 0);
          current = maxSeq;
        }
        const next = current + 1;
        set({ lastInvoiceSequence: next });
        const padded = String(next).padStart(4, '0');
        return `#MP${padded}`;
      },
      
      // Utility actions
      clearAllData: () => {
        set({
        members: [],
        invoices: [],
        followUps: [],
          activities: [],
          checkIns: [],
          proteins: [],
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
          proteins: state.proteins,
        }, null, 2);
      },
      
      importData: (data) => {
        try {
          const parsedData = JSON.parse(data);
           set({
            members: parsedData.members || [],
            trainers: parsedData.trainers || [],
            visitors: parsedData.visitors || [],
            invoices: parsedData.invoices || [],
            followUps: parsedData.followUps || [],
            activities: parsedData.activities || [],
            checkIns: parsedData.checkIns || [],
            proteins: parsedData.proteins || [],
          });
         } catch (error) {
          console.error('Failed to import data:', error);
        }
      },

      // Initialize demo data
      initializeDemoData: () => {
        const demoData = {
          members: [],  // Add demo members here if needed
          trainers: [], // Add demo trainers here if needed
          visitors: [], // Add demo visitors here if needed
          invoices: [], // Add demo invoices here if needed
          followUps: [], // Add demo followups here if needed
          activities: [], // Add demo activities here if needed
          checkIns: [], // Add demo checkins here if needed
          proteins: [], // Add demo proteins here if needed
        };
        set(demoData);
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
        proteins: state.proteins,
        pricing: state.pricing,
        termsAndConditions: state.termsAndConditions,
        lastInvoiceSequence: state.lastInvoiceSequence,
      }),
    }
  )
);
