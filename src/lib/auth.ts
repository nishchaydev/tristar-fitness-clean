export interface User {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'trainer';
  name: string;
  phone?: string;
  createdAt: string;
  lastLogin: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Sample users for demonstration
export const sampleUsers: User[] = [
  {
    id: '1',
    username: 'nikhil',
    email: 'nikhil@tristarfitness.com',
    role: 'owner',
    name: 'Nikhil Verma',
    phone: '+91 98765 43210',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'yash',
    email: 'yash@tristarfitness.com',
    role: 'trainer',
    name: 'Yash',
    phone: '+91 98765 43211',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'mohit',
    email: 'mohit@tristarfitness.com',
    role: 'trainer',
    name: 'Mohit Sen',
    phone: '+91 98765 43212',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '4',
    username: 'palak',
    email: 'palak@tristarfitness.com',
    role: 'trainer',
    name: 'Palak Dubey',
    phone: '+91 98765 43213',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
];

// Simple password storage (in real app, use proper hashing)
const userPasswords: Record<string, string> = {
  'nikhil': 'nikhil123',
  'yash': 'yash123',
  'mohit': 'mohit123',
  'palak': 'palak123',
};

// Authentication functions
export const authenticateUser = (credentials: LoginCredentials): User | null => {
  const user = sampleUsers.find(u => u.username === credentials.username);
  
  if (user && userPasswords[credentials.username] === credentials.password) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    return user;
  }
  
  return null;
};

export const getUserById = (id: string): User | null => {
  return sampleUsers.find(u => u.id === id) || null;
};

export const isOwner = (user: User | null): boolean => {
  return user?.role === 'owner';
};

export const isTrainer = (user: User | null): boolean => {
  return user?.role === 'trainer';
};

export const hasPermission = (user: User | null, requiredRole: 'owner' | 'trainer'): boolean => {
  if (!user) return false;
  
  if (requiredRole === 'owner') {
    return user.role === 'owner';
  }
  
  // Trainers can access trainer-level features
  return user.role === 'trainer' || user.role === 'owner';
};
