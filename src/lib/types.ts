export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'expired' | 'suspended';
  membershipType?: string;
  startDate?: string;
  expiryDate?: string;
  lastVisit?: string;
  assignedTrainer?: string;
  emergencyContact?: string;
  address?: string;
  medicalConditions?: string;
  goals?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  description?: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'member' | 'trainer' | 'visitor' | 'invoice' | 'followup';
  action: string;
  name: string;
  time: string;
  details?: string;
  memberId?: string;
  trainerId?: string;
  visitorId?: string;
  invoiceId?: string;
  createdAt: string;
}