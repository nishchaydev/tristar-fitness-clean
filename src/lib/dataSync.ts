import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import React from 'react'

// Data interfaces
export interface Member {
  id: string
  name: string
  email: string
  phone: string
  membershipType: 'monthly' | 'quarterly' | 'annual'
  startDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'pending'
  lastVisit?: string
  totalVisits: number
  assignedTrainer?: string
}

export interface Trainer {
  id: string
  name: string
  phone: string
  email: string
  specialization: string
  checkInTime?: string
  checkOutTime?: string
  status: 'available' | 'busy' | 'offline'
  currentSessions: number
  totalSessions: number
  joinDate: string
  salary: number
}

export interface Session {
  id: string
  trainerId: string
  trainerName: string
  memberName: string
  startTime: string
  endTime?: string
  type: 'personal' | 'group' | 'consultation'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface Visitor {
  id: string
  name: string
  phone: string
  email?: string
  checkInTime: string
  checkOutTime?: string
  purpose: string
  status: 'checked-in' | 'checked-out'
}

export interface Invoice {
  id: string
  memberId: string
  memberName: string
  amount: number
  description: string
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  createdAt: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

export interface FollowUp {
  id: string
  memberId: string
  memberName: string
  type: 'membership_expiry' | 'payment_reminder' | 'visit_reminder'
  status: 'pending' | 'completed' | 'snoozed'
  dueDate: string
  notes: string
  createdAt: string
  completedAt?: string
}

export interface Activity {
  id: string
  type: 'member' | 'visitor' | 'trainer' | 'invoice' | 'followup'
  action: string
  name: string
  time: string
  details?: string
  memberId?: string
  trainerId?: string
  visitorId?: string
  invoiceId?: string
}

// Store interface
interface DataStore {
  // Data
  members: Member[]
  trainers: Trainer[]
  sessions: Session[]
  visitors: Visitor[]
  invoices: Invoice[]
  followUps: FollowUp[]
  activities: Activity[]
  
  // Actions
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  
  addTrainer: (trainer: Omit<Trainer, 'id'>) => void
  updateTrainer: (id: string, updates: Partial<Trainer>) => void
  deleteTrainer: (id: string) => void
  
  addSession: (session: Omit<Session, 'id'>) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  deleteSession: (id: string) => void
  
  addVisitor: (visitor: Omit<Visitor, 'id'>) => void
  updateVisitor: (id: string, updates: Partial<Visitor>) => void
  deleteVisitor: (id: string) => void
  
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  
  addFollowUp: (followUp: Omit<FollowUp, 'id'>) => void
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void
  deleteFollowUp: (id: string) => void
  
  addActivity: (activity: Omit<Activity, 'id'>) => void
  
  // Computed values
  getMemberById: (id: string) => Member | undefined
  getTrainerById: (id: string) => Trainer | undefined
  getSessionsByTrainer: (trainerId: string) => Session[]
  getMembersByTrainer: (trainerId: string) => Member[]
  getActiveSessions: () => Session[]
  getExpiringMembers: () => Member[]
  getTotalRevenue: () => number
  getPendingFollowUps: () => FollowUp[]
  getRecentActivities: (limit?: number) => Activity[]
  
  // Data management functions
  clearAllData: () => void
  importData: (data: any) => void
  initializeDemoData: () => void
}

// Initial data
const initialMembers: Member[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    membershipType: 'monthly',
    startDate: '2024-01-01',
    expiryDate: '2024-02-01',
    status: 'active',
    lastVisit: '2024-01-15T10:30:00',
    totalVisits: 12,
    assignedTrainer: '1'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 98765 43211',
    membershipType: 'quarterly',
    startDate: '2024-01-01',
    expiryDate: '2024-04-01',
    status: 'active',
    lastVisit: '2024-01-14T15:45:00',
    totalVisits: 8,
    assignedTrainer: '2'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    phone: '+91 98765 43212',
    membershipType: 'annual',
    startDate: '2024-01-01',
    expiryDate: '2025-01-01',
    status: 'active',
    lastVisit: '2024-01-13T09:15:00',
    totalVisits: 25,
    assignedTrainer: '1'
  },
  {
    id: '4',
    name: 'Neha Singh',
    email: 'neha.singh@email.com',
    phone: '+91 98765 43213',
    membershipType: 'monthly',
    startDate: '2023-12-01',
    expiryDate: '2024-01-01',
    status: 'expired',
    lastVisit: '2023-12-28T16:20:00',
    totalVisits: 6
  },
  {
    id: '5',
    name: 'Raj Malhotra',
    email: 'raj.malhotra@email.com',
    phone: '+91 98765 43214',
    membershipType: 'monthly',
    startDate: '2024-01-15',
    expiryDate: '2024-02-15',
    status: 'pending',
    totalVisits: 0
  },
  {
    id: '6',
    name: 'Sneha Verma',
    email: 'sneha.verma@email.com',
    phone: '+91 98765 43216',
    membershipType: 'quarterly',
    startDate: '2024-01-10',
    expiryDate: '2024-04-10',
    status: 'active',
    lastVisit: '2024-01-16T14:20:00',
    totalVisits: 15,
    assignedTrainer: '3'
  },
  {
    id: '7',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 98765 43217',
    membershipType: 'annual',
    startDate: '2023-11-01',
    expiryDate: '2024-11-01',
    status: 'active',
    lastVisit: '2024-01-17T08:45:00',
    totalVisits: 42,
    assignedTrainer: '1'
  },
  {
    id: '8',
    name: 'Anjali Desai',
    email: 'anjali.desai@email.com',
    phone: '+91 98765 43218',
    membershipType: 'monthly',
    startDate: '2024-01-20',
    expiryDate: '2024-02-20',
    status: 'active',
    lastVisit: '2024-01-18T16:30:00',
    totalVisits: 3,
    assignedTrainer: '2'
  }
]

const initialTrainers: Trainer[] = [
  {
    id: '1',
    name: 'Yash',
    phone: '+91 98765 43210',
    email: 'yash@tristarfitness.com',
    specialization: 'Weight Training & Bodybuilding',
    status: 'available',
    currentSessions: 0,
    totalSessions: 8,
    joinDate: '2023-06-01',
    salary: 25000
  },
  {
    id: '2',
    name: 'Mohit Sen',
    phone: '+91 98765 43211',
    email: 'mohit@tristarfitness.com',
    specialization: 'Yoga & Pilates',
    status: 'busy',
    currentSessions: 1,
    totalSessions: 6,
    joinDate: '2023-08-15',
    salary: 22000
  },
  {
    id: '3',
    name: 'Palak Dubey',
    phone: '+91 98765 43212',
    email: 'palak@tristarfitness.com',
    specialization: 'Cardio & HIIT',
    status: 'available',
    currentSessions: 0,
    totalSessions: 5,
    joinDate: '2023-09-01',
    salary: 20000
  },
  {
    id: '4',
    name: 'Arjun Mehta',
    phone: '+91 98765 43219',
    email: 'arjun@tristarfitness.com',
    specialization: 'CrossFit & Functional Training',
    status: 'available',
    currentSessions: 0,
    totalSessions: 12,
    joinDate: '2023-07-01',
    salary: 28000
  }
]

const initialSessions: Session[] = [
  {
    id: '1',
    trainerId: '2',
    trainerName: 'Mohit Sen',
    memberName: 'Neha Singh',
    startTime: '2024-01-15T10:00:00',
    type: 'personal',
    status: 'in-progress'
  },
  {
    id: '2',
    trainerId: '1',
    trainerName: 'Yash',
    memberName: 'Rahul Sharma',
    startTime: '2024-01-16T09:00:00',
    endTime: '2024-01-16T10:00:00',
    type: 'personal',
    status: 'completed'
  },
  {
    id: '3',
    trainerId: '3',
    trainerName: 'Palak Dubey',
    memberName: 'Sneha Verma',
    startTime: '2024-01-17T14:00:00',
    type: 'group',
    status: 'scheduled'
  },
  {
    id: '4',
    trainerId: '1',
    trainerName: 'Yash',
    memberName: 'Amit Kumar',
    startTime: '2024-01-18T16:00:00',
    type: 'personal',
    status: 'scheduled'
  }
]

const initialVisitors: Visitor[] = [
  {
    id: '1',
    name: 'Raj Malhotra',
    phone: '+91 98765 43215',
    email: 'raj.visitor@email.com',
    checkInTime: '2024-01-15T09:00:00',
    purpose: 'Gym Tour & Consultation',
    status: 'checked-in'
  },
  {
    id: '2',
    name: 'Priya Gupta',
    phone: '+91 98765 43220',
    email: 'priya.guesta@email.com',
    checkInTime: '2024-01-16T11:00:00',
    checkOutTime: '2024-01-16T12:30:00',
    purpose: 'Free Trial Session',
    status: 'checked-out'
  },
  {
    id: '3',
    name: 'Karan Malhotra',
    phone: '+91 98765 43221',
    email: 'karan.guest@email.com',
    checkInTime: '2024-01-17T15:00:00',
    purpose: 'Membership Inquiry',
    status: 'checked-in'
  },
  {
    id: '4',
    name: 'Meera Kapoor',
    phone: '+91 98765 43222',
    email: 'meera.visitor@email.com',
    checkInTime: '2024-01-18T10:00:00',
    purpose: 'Equipment Demo',
    status: 'checked-in'
  }
]

const initialInvoices: Invoice[] = [
  {
    id: '1',
    memberId: '1',
    memberName: 'Rahul Sharma',
    amount: 1500,
    description: 'Monthly Membership - January 2024',
    dueDate: '2024-02-01',
    status: 'paid',
    createdAt: '2024-01-01T00:00:00.000Z',
    items: [
      {
        id: '1',
        description: 'Monthly Membership',
        quantity: 1,
        price: 999,
        total: 999
      }
    ],
    subtotal: 999,
    tax: 179.82,
    total: 1178.82
  },
  {
    id: '2',
    memberId: '2',
    memberName: 'Priya Patel',
    amount: 2500,
    description: 'Quarterly Membership - Q1 2024',
    dueDate: '2024-01-15',
    status: 'paid',
    createdAt: '2024-01-01T00:00:00.000Z',
    items: [
      {
        id: '2',
        description: 'Quarterly Membership',
        quantity: 1,
        price: 1999,
        total: 1999
      }
    ],
    subtotal: 1999,
    tax: 359.82,
    total: 2358.82
  },
  {
    id: '3',
    memberId: '3',
    memberName: 'Amit Kumar',
    amount: 5000,
    description: 'Annual Membership - 2024',
    dueDate: '2024-01-20',
    status: 'paid',
    createdAt: '2024-01-01T00:00:00.000Z',
    items: [
      {
        id: '3',
        description: 'Annual Membership',
        quantity: 1,
        price: 3999,
        total: 3999
      }
    ],
    subtotal: 3999,
    tax: 719.82,
    total: 4718.82
  },
  {
    id: '4',
    memberId: '6',
    memberName: 'Sneha Verma',
    amount: 3000,
    description: 'Quarterly Membership - Q1 2024',
    dueDate: '2024-02-10',
    status: 'pending',
    createdAt: '2024-01-10T00:00:00.000Z',
    items: [
      {
        id: '4',
        description: 'Quarterly Membership',
        quantity: 1,
        price: 2499,
        total: 2499
      }
    ],
    subtotal: 2499,
    tax: 449.82,
    total: 2948.82
  },
  {
    id: '5',
    memberId: '7',
    memberName: 'Vikram Singh',
    amount: 10000,
    description: 'Annual Membership Renewal - 2024',
    dueDate: '2024-02-01',
    status: 'pending',
    createdAt: '2024-01-15T00:00:00.000Z',
    items: [
      {
        id: '5',
        description: 'Annual Membership',
        quantity: 1,
        price: 8999,
        total: 8999
      }
    ],
    subtotal: 8999,
    tax: 1619.82,
    total: 10618.82
  }
]

const initialFollowUps: FollowUp[] = [
  {
    id: '1',
    memberId: '4',
    memberName: 'Neha Singh',
    type: 'membership_expiry',
    status: 'pending',
    dueDate: '2024-01-01',
    notes: 'Membership expired, need to contact for renewal. She was interested in upgrading to quarterly plan.',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    memberId: '5',
    memberName: 'Raj Malhotra',
    type: 'payment_reminder',
    status: 'pending',
    dueDate: '2024-01-25',
    notes: 'New member, first payment due. Send welcome message and payment reminder.',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '3',
    memberId: '6',
    memberName: 'Sneha Verma',
    type: 'visit_reminder',
    status: 'pending',
    dueDate: '2024-01-30',
    notes: 'Haven\'t seen her this week. Send motivational message and check if she needs any support.',
    createdAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: '4',
    memberId: '7',
    memberName: 'Vikram Singh',
    type: 'membership_expiry',
    status: 'pending',
    dueDate: '2024-02-01',
    notes: 'Annual membership expiring soon. He\'s been very consistent, offer loyalty discount for renewal.',
    createdAt: '2024-01-25T00:00:00.000Z'
  },
  {
    id: '5',
    memberId: '8',
    memberName: 'Anjali Desai',
    type: 'visit_reminder',
    status: 'completed',
    dueDate: '2024-01-22',
    notes: 'New member orientation completed. She\'s excited about starting her fitness journey.',
    createdAt: '2024-01-20T00:00:00.000Z',
    completedAt: '2024-01-22T10:00:00.000Z'
  }
]

const initialActivities: Activity[] = [
  {
    id: '1',
    type: 'member',
    action: 'New member registered',
    name: 'Rahul Sharma',
    time: '2024-01-15T10:30:00',
    memberId: '1'
  },
  {
    id: '2',
    type: 'visitor',
    action: 'Visitor checked in',
    name: 'Raj Malhotra',
    time: '2024-01-15T09:00:00',
    visitorId: '1'
  },
  {
    id: '3',
    type: 'trainer',
    action: 'Trainer checked in',
    name: 'Yash',
    time: '2024-01-15T08:00:00',
    trainerId: '1'
  },
  {
    id: '4',
    type: 'trainer',
    action: 'Personal training session started',
    name: 'Mohit Sen with Neha Singh',
    time: '2024-01-15T10:00:00',
    trainerId: '2',
    memberId: '4'
  },
  {
    id: '5',
    type: 'invoice',
    action: 'Invoice generated',
    name: 'Priya Patel - Quarterly Membership',
    time: '2024-01-16T14:00:00',
    memberId: '2'
  },
  {
    id: '6',
    type: 'member',
    action: 'Membership renewed',
    name: 'Amit Kumar',
    time: '2024-01-17T11:00:00',
    memberId: '3'
  },
  {
    id: '7',
    type: 'visitor',
    action: 'Free trial session completed',
    name: 'Priya Gupta',
    time: '2024-01-16T12:30:00',
    visitorId: '2'
  },
  {
    id: '8',
    type: 'followup',
    action: 'Follow-up completed',
    name: 'Anjali Desai',
    time: '2024-01-22T10:00:00',
    memberId: '8'
  }
]

// Hook to initialize demo data if store is empty
export const useInitializeDemoData = () => {
  const { members, trainers, visitors, invoices, followUps, activities, initializeDemoData } = useDataStore()
  
  React.useEffect(() => {
    // Check if store is empty and initialize demo data
    if (members.length === 0 && trainers.length === 0 && visitors.length === 0 && 
        invoices.length === 0 && followUps.length === 0 && activities.length === 0) {
      console.log('Store is empty, initializing demo data...')
      initializeDemoData()
    }
  }, [members.length, trainers.length, visitors.length, invoices.length, followUps.length, activities.length, initializeDemoData])
}

// Create the store
export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      // Initial state
      members: initialMembers,
      trainers: initialTrainers,
      sessions: initialSessions,
      visitors: initialVisitors,
      invoices: initialInvoices,
      followUps: initialFollowUps,
      activities: initialActivities,

      // Member actions
      addMember: (member) => set((state) => {
        const newMember = { ...member, id: Date.now().toString() }
        return {
          members: [...state.members, newMember],
          activities: [{
            id: Date.now().toString(),
            type: 'member',
            action: 'New member registered',
            name: newMember.name,
            time: new Date().toISOString(),
            memberId: newMember.id
          }, ...state.activities]
        }
      }),

      updateMember: (id, updates) => set((state) => {
        const updatedMember = state.members.find(member => member.id === id)
        if (!updatedMember) return state
        
        return {
          members: state.members.map(member =>
            member.id === id ? { ...member, ...updates } : member
          ),
          activities: [{
            id: Date.now().toString(),
            type: 'member',
            action: 'Member updated',
            name: updatedMember.name,
            time: new Date().toISOString(),
            memberId: id,
            details: `Updated: ${Object.keys(updates).join(', ')}`
          }, ...state.activities]
        }
      }),

      deleteMember: (id) => set((state) => {
        const deletedMember = state.members.find(member => member.id === id)
        if (!deletedMember) return state
        
        return {
          members: state.members.filter(member => member.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'member',
            action: 'Member deleted',
            name: deletedMember.name,
            time: new Date().toISOString(),
            details: 'Member removed from system'
          }, ...state.activities]
        }
      }),

      // Trainer actions
      addTrainer: (trainer) => set((state) => {
        const newTrainer = { ...trainer, id: Date.now().toString() }
        return {
          trainers: [...state.trainers, newTrainer],
          activities: [{
            id: Date.now().toString(),
            type: 'trainer',
            action: 'New trainer added',
            name: newTrainer.name,
            time: new Date().toISOString(),
            trainerId: newTrainer.id
          }, ...state.activities]
        }
      }),

      updateTrainer: (id, updates) => set((state) => {
        const updatedTrainer = state.trainers.find(trainer => trainer.id === id)
        if (!updatedTrainer) return state
        
        return {
          trainers: state.trainers.map(trainer =>
            trainer.id === id ? { ...trainer, ...updates } : trainer
          ),
          activities: [{
            id: Date.now().toString(),
            type: 'trainer',
            action: 'Trainer updated',
            name: updatedTrainer.name,
            time: new Date().toISOString(),
            trainerId: id,
            details: `Updated: ${Object.keys(updates).join(', ')}`
          }, ...state.activities]
        }
      }),

      deleteTrainer: (id) => set((state) => {
        const deletedTrainer = state.trainers.find(trainer => trainer.id === id)
        if (!deletedTrainer) return state
        
        return {
          trainers: state.trainers.filter(trainer => trainer.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'trainer',
            action: 'Trainer removed',
            name: deletedTrainer.name,
            time: new Date().toISOString(),
            details: 'Trainer removed from system'
          }, ...state.activities]
        }
      }),

      // Session actions
      addSession: (session) => set((state) => {
        const newSession = { ...session, id: Date.now().toString() }
        return {
          sessions: [...state.sessions, newSession],
          activities: [{
            id: Date.now().toString(),
            type: 'trainer',
            action: 'Training session started',
            name: `${newSession.trainerName} → ${newSession.memberName}`,
            time: new Date().toISOString(),
            trainerId: newSession.trainerId
          }, ...state.activities]
        }
      }),

      updateSession: (id, updates) => set((state) => {
        const updatedSession = state.sessions.find(session => session.id === id)
        if (!updatedSession) return state
        
        return {
          sessions: state.sessions.map(session =>
            session.id === id ? { ...session, ...updates } : session
          ),
          activities: [{
            id: Date.now().toString(),
            type: 'trainer',
            action: updates.status === 'completed' ? 'Training session completed' : 'Session updated',
            name: `${updatedSession.trainerName} → ${updatedSession.memberName}`,
            time: new Date().toISOString(),
            trainerId: updatedSession.trainerId,
            details: updates.status === 'completed' ? 'Session completed' : `Updated: ${Object.keys(updates).join(', ')}`
          }, ...state.activities]
        }
      }),

      deleteSession: (id) => set((state) => {
        const deletedSession = state.sessions.find(session => session.id === id)
        if (!deletedSession) return state
        
        return {
          sessions: state.sessions.filter(session => session.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'trainer',
            action: 'Training session cancelled',
            name: `${deletedSession.trainerName} → ${deletedSession.memberName}`,
            time: new Date().toISOString(),
            trainerId: deletedSession.trainerId,
            details: 'Session cancelled'
          }, ...state.activities]
        }
      }),

      // Visitor actions
      addVisitor: (visitor) => set((state) => {
        const newVisitor = { ...visitor, id: Date.now().toString() }
        return {
          visitors: [...state.visitors, newVisitor],
          activities: [{
            id: Date.now().toString(),
            type: 'visitor',
            action: 'Visitor checked in',
            name: newVisitor.name,
            time: new Date().toISOString(),
            visitorId: newVisitor.id
          }, ...state.activities]
        }
      }),

      updateVisitor: (id, updates) => set((state) => {
        const updatedVisitor = state.visitors.find(visitor => visitor.id === id)
        if (!updatedVisitor) return state
        
        return {
          visitors: state.visitors.map(visitor =>
            visitor.id === id ? { ...visitor, ...updates } : visitor
          ),
          activities: [{
            id: Date.now().toString(),
            type: 'visitor',
            action: updates.status === 'checked-out' ? 'Visitor checked out' : 'Visitor updated',
            name: updatedVisitor.name,
            time: new Date().toISOString(),
            visitorId: id,
            details: updates.status === 'checked-out' ? 'Checked out' : `Updated: ${Object.keys(updates).join(', ')}`
          }, ...state.activities]
        }
      }),

      deleteVisitor: (id) => set((state) => {
        const deletedVisitor = state.visitors.find(visitor => visitor.id === id)
        if (!deletedVisitor) return state
        
        return {
          visitors: state.visitors.filter(visitor => visitor.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'visitor',
            action: 'Visitor removed',
            name: deletedVisitor.name,
            time: new Date().toISOString(),
            details: 'Visitor removed from system'
          }, ...state.activities]
        }
      }),

      // Invoice actions
      addInvoice: (invoice) => set((state) => {
        const newInvoice = { ...invoice, id: Date.now().toString() }
        return {
          invoices: [...state.invoices, newInvoice],
          activities: [{
            id: Date.now().toString(),
            type: 'invoice',
            action: 'Invoice generated',
            name: `Invoice ${newInvoice.id} - ${newInvoice.memberName}`,
            time: new Date().toISOString(),
            memberId: newInvoice.memberId,
            invoiceId: newInvoice.id,
            details: `Amount: ${newInvoice.amount}`
          }, ...state.activities]
        }
      }),

      updateInvoice: (id, updates) => set((state) => {
        const updatedInvoice = state.invoices.find(invoice => invoice.id === id)
        if (!updatedInvoice) return state
        
        return {
          invoices: state.invoices.map(invoice =>
            invoice.id === id ? { ...invoice, ...updates } : invoice
          ),
          activities: [{
            id: Date.now().toString(),
            type: 'invoice',
            action: updates.status === 'paid' ? 'Invoice paid' : 'Invoice updated',
            name: `Invoice ${updatedInvoice.id} - ${updatedInvoice.memberName}`,
            time: new Date().toISOString(),
            memberId: updatedInvoice.memberId,
            invoiceId: id,
            details: updates.status === 'paid' ? 'Payment received' : `Updated: ${Object.keys(updates).join(', ')}`
          }, ...state.activities]
        }
      }),

      deleteInvoice: (id) => set((state) => {
        const deletedInvoice = state.invoices.find(invoice => invoice.id === id)
        if (!deletedInvoice) return state
        
        return {
          invoices: state.invoices.filter(invoice => invoice.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'invoice',
            action: 'Invoice deleted',
            name: `Invoice ${deletedInvoice.id} - ${deletedInvoice.memberName}`,
            time: new Date().toISOString(),
            memberId: deletedInvoice.memberId,
            details: 'Invoice removed from system'
          }, ...state.activities]
        }
      }),

      // Follow-up actions
      addFollowUp: (followUp) => set((state) => {
        const newFollowUp = { ...followUp, id: Date.now().toString() }
        return {
          followUps: [...state.followUps, newFollowUp],
          activities: [{
            id: Date.now().toString(),
            type: 'followup',
            action: 'Follow-up created',
            name: newFollowUp.memberName,
            time: new Date().toISOString(),
            memberId: newFollowUp.memberId,
            details: `${newFollowUp.type} follow-up created`
          }, ...state.activities]
        }
      }),

      updateFollowUp: (id, updates) => set((state) => {
        const updatedFollowUp = state.followUps.find(followUp => followUp.id === id)
        if (!updatedFollowUp) return state
        
        return {
          followUps: state.followUps.map(followUp =>
            followUp.id === id ? { ...followUp, ...updates } : followUp
          ),
          activities: [{
            id: Date.now().toString(),
            type: 'followup',
            action: updates.status === 'completed' ? 'Follow-up completed' : 'Follow-up updated',
            name: updatedFollowUp.memberName,
            time: new Date().toISOString(),
            memberId: updatedFollowUp.memberId,
            details: updates.status === 'completed' ? 'Follow-up completed' : `Updated: ${Object.keys(updates).join(', ')}`
          }, ...state.activities]
        }
      }),

      deleteFollowUp: (id) => set((state) => {
        const deletedFollowUp = state.followUps.find(followUp => followUp.id === id)
        if (!deletedFollowUp) return state
        
        return {
          followUps: state.followUps.filter(followUp => followUp.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'followup',
            action: 'Follow-up removed',
            name: deletedFollowUp.memberName,
            time: new Date().toISOString(),
            memberId: deletedFollowUp.memberId,
            details: 'Follow-up removed from system'
          }, ...state.activities]
        }
      }),

      // Activity actions
      addActivity: (activity) => set((state) => ({
        activities: [{ ...activity, id: Date.now().toString() }, ...state.activities]
      })),

      // Computed values
      getMemberById: (id) => get().members.find(member => member.id === id),
      getTrainerById: (id) => get().trainers.find(trainer => trainer.id === id),
      
      getSessionsByTrainer: (trainerId) => 
        get().sessions.filter(session => session.trainerId === trainerId),
      
      getMembersByTrainer: (trainerId) => 
        get().members.filter(member => member.assignedTrainer === trainerId),
      
      getActiveSessions: () => 
        get().sessions.filter(session => session.status === 'in-progress'),
      
      getExpiringMembers: () => {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        
        return get().members.filter(member => {
          const expiryDate = new Date(member.expiryDate)
          return expiryDate <= thirtyDaysFromNow && member.status === 'active'
        })
      },
      
      getTotalRevenue: () => 
        get().invoices
          .filter(invoice => invoice.status === 'paid')
          .reduce((total, invoice) => total + invoice.total, 0),
      
      getPendingFollowUps: () => 
        get().followUps.filter(followUp => followUp.status === 'pending'),
      
      getRecentActivities: (limit = 10) => 
        get().activities.slice(0, limit),
      
      // Debug function to check store state
      debugStore: () => {
        const state = get()
        console.log('Data Store State:', {
          members: state.members.length,
          trainers: state.trainers.length,
          sessions: state.sessions.length,
          visitors: state.visitors.length,
          invoices: state.invoices.length,
          followUps: state.followUps.length,
          activities: state.activities.length
        })
        return state
      },

      // Data management functions
      clearAllData: () => set({
        members: [],
        trainers: [],
        sessions: [],
        visitors: [],
        invoices: [],
        followUps: [],
        activities: []
      }),

      importData: (data: any) => set((state) => {
        // Validate and merge imported data
        const newState = { ...state }
        
        if (data.members && Array.isArray(data.members)) {
          newState.members = data.members
        }
        if (data.trainers && Array.isArray(data.trainers)) {
          newState.trainers = data.trainers
        }
        if (data.sessions && Array.isArray(data.sessions)) {
          newState.sessions = data.sessions
        }
        if (data.visitors && Array.isArray(data.visitors)) {
          newState.visitors = data.visitors
        }
        if (data.invoices && Array.isArray(data.invoices)) {
          newState.invoices = data.invoices
        }
        if (data.followUps && Array.isArray(data.followUps)) {
          newState.followUps = data.followUps
        }
        if (data.activities && Array.isArray(data.activities)) {
          newState.activities = data.activities
        }
        
        return newState
      }),

      initializeDemoData: () => set({
        members: initialMembers,
        trainers: initialTrainers,
        sessions: initialSessions,
        visitors: initialVisitors,
        invoices: initialInvoices,
        followUps: initialFollowUps,
        activities: initialActivities
      })
    }),
    {
      name: 'tristar-fitness-data',
      partialize: (state) => ({
        members: state.members,
        trainers: state.trainers,
        sessions: state.sessions,
        visitors: state.visitors,
        invoices: state.invoices,
        followUps: state.followUps,
        activities: state.activities
      })
    }
  )
)
