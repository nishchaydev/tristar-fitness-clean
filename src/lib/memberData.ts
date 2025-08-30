export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipStartDate: string;
  membershipDuration: '1_month' | '3_months' | '1_year';
  membershipEndDate: string;
  status: 'active' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// Calculate membership end date based on start date and duration
export const calculateEndDate = (startDate: string, duration: string): string => {
  const start = new Date(startDate);
  const end = new Date(start);
  
  switch (duration) {
    case '1_month':
      end.setMonth(end.getMonth() + 1);
      break;
    case '3_months':
      end.setMonth(end.getMonth() + 3);
      break;
    case '1_year':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  
  return end.toISOString().split('T')[0];
};

// Calculate membership status based on end date
export const calculateStatus = (endDate: string): 'active' | 'expired' => {
  const today = new Date();
  const end = new Date(endDate);
  return end >= today ? 'active' : 'expired';
};

// Check if membership expires within days
export const isExpiringWithinDays = (endDate: string, days: number = 7): boolean => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays >= 0;
};

// Format duration for display
export const formatDuration = (duration: string): string => {
  switch (duration) {
    case '1_month':
      return '1 Month';
    case '3_months':
      return '3 Months';
    case '1_year':
      return '1 Year';
    default:
      return duration;
  }
};

// Local storage utilities
export const STORAGE_KEY = 'tristar_fitness_members';

export const getMembers = (): Member[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading members from localStorage:', error);
    return [];
  }
};

export const saveMembers = (members: Member[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('Error saving members to localStorage:', error);
  }
};

export const addMember = (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'membershipEndDate' | 'status'>): Member => {
  const members = getMembers();
  const id = Date.now().toString();
  const now = new Date().toISOString();
  const endDate = calculateEndDate(memberData.membershipStartDate, memberData.membershipDuration);
  
  const newMember: Member = {
    ...memberData,
    id,
    membershipEndDate: endDate,
    status: calculateStatus(endDate),
    createdAt: now,
    updatedAt: now,
  };
  
  members.push(newMember);
  saveMembers(members);
  return newMember;
};

export const updateMember = (id: string, updates: Partial<Member>): Member | null => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  
  if (index === -1) return null;
  
  const updatedMember = {
    ...members[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // Recalculate end date and status if start date or duration changed
  if (updates.membershipStartDate || updates.membershipDuration) {
    updatedMember.membershipEndDate = calculateEndDate(
      updatedMember.membershipStartDate,
      updatedMember.membershipDuration
    );
    updatedMember.status = calculateStatus(updatedMember.membershipEndDate);
  }
  
  members[index] = updatedMember;
  saveMembers(members);
  return updatedMember;
};

export const deleteMember = (id: string): boolean => {
  const members = getMembers();
  const filteredMembers = members.filter(m => m.id !== id);
  
  if (filteredMembers.length === members.length) return false;
  
  saveMembers(filteredMembers);
  return true;
};

export const getMemberById = (id: string): Member | null => {
  const members = getMembers();
  return members.find(m => m.id === id) || null;
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  const members = getMembers();
  if (members.length === 0) {
    const sampleMembers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 98765 43210',
        membershipStartDate: '2024-08-01',
        membershipDuration: '1_year' as const,
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 98765 43211',
        membershipStartDate: '2024-08-25',
        membershipDuration: '1_month' as const,
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+91 98765 43212',
        membershipStartDate: '2024-06-15',
        membershipDuration: '3_months' as const,
      },
    ];
    
    sampleMembers.forEach(member => addMember(member));
  }
};
