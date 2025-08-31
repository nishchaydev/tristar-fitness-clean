import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Data interfaces
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  lastVisit?: string;
  totalVisits: number;
  assignedTrainer?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Trainer {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialization: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'available' | 'busy' | 'offline';
  currentSessions: number;
  totalSessions: number;
  joinDate: string;
  salary: number;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  trainerId: string;
  trainerName: string;
  memberName: string;
  startTime: string;
  endTime?: string;
  type: 'personal' | 'group' | 'consultation';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  checkInTime: string;
  checkOutTime?: string;
  purpose: string;
  status: 'checked-in' | 'checked-out';
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface FollowUp {
  id: string;
  memberId: string;
  memberName: string;
  type: 'membership_expiry' | 'payment_reminder' | 'visit_reminder';
  status: 'pending' | 'completed' | 'snoozed';
  dueDate: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
  created_at?: string;
  updated_at?: string;
}

// Supabase data service
export class SupabaseService {
  // Check if Supabase is properly configured
  static isConfigured(): boolean {
    return supabaseUrl !== 'https://your-project-id.supabase.co' && 
           supabaseKey !== 'your-anon-key-here';
  }

  // Test connection
  static async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('⚠️ Supabase not configured');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }

  // Members
  static async getMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return [];
    }
  }

  static async createMember(member: Omit<Member, 'id'>): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create member:', error);
      return null;
    }
  }

  static async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update member:', error);
      return null;
    }
  }

  static async deleteMember(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete member:', error);
      return false;
    }
  }

  // Trainers
  static async getTrainers(): Promise<Trainer[]> {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      return [];
    }
  }

  static async createTrainer(trainer: Omit<Trainer, 'id'>): Promise<Trainer | null> {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .insert(trainer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create trainer:', error);
      return null;
    }
  }

  static async updateTrainer(id: string, updates: Partial<Trainer>): Promise<Trainer | null> {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update trainer:', error);
      return null;
    }
  }

  static async deleteTrainer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete trainer:', error);
      return false;
    }
  }

  // Sessions
  static async getSessions(): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  }

  static async createSession(session: Omit<Session, 'id'>): Promise<Session | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }

  // Visitors
  static async getVisitors(): Promise<Visitor[]> {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
      return [];
    }
  }

  static async createVisitor(visitor: Omit<Visitor, 'id'>): Promise<Visitor | null> {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .insert(visitor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create visitor:', error);
      return null;
    }
  }

  // Invoices
  static async getInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return [];
    }
  }

  static async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      return null;
    }
  }

  // Follow-ups
  static async getFollowUps(): Promise<FollowUp[]> {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error);
      return [];
    }
  }

  static async createFollowUp(followUp: Omit<FollowUp, 'id'>): Promise<FollowUp | null> {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert(followUp)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create follow-up:', error);
      return null;
    }
  }

  // Sync all data
  static async syncAllData(): Promise<{
    members: Member[];
    trainers: Trainer[];
    sessions: Session[];
    visitors: Visitor[];
    invoices: Invoice[];
    followUps: FollowUp[];
  }> {
    try {
      const [members, trainers, sessions, visitors, invoices, followUps] = await Promise.all([
        this.getMembers(),
        this.getTrainers(),
        this.getSessions(),
        this.getVisitors(),
        this.getInvoices(),
        this.getFollowUps(),
      ]);

      return {
        members,
        trainers,
        sessions,
        visitors,
        invoices,
        followUps,
      };
    } catch (error) {
      console.error('Failed to sync data:', error);
      return {
        members: [],
        trainers: [],
        sessions: [],
        visitors: [],
        invoices: [],
        followUps: [],
      };
    }
  }
}
