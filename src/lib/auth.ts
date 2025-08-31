export interface User {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'trainer' | 'semi-admin';
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

// Sample users for demonstration (using fictional data)
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
    phone: '+91 98765 43210',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'mohit',
    email: 'mohit@tristarfitness.com',
    role: 'trainer',
    name: 'Mohit Sen',
    phone: '+91 98765 43211',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '4',
    username: 'palak',
    email: 'palak@tristarfitness.com',
    role: 'trainer',
    name: 'Palak Dubey',
    phone: '+91 98765 43212',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '5',
    username: 'owner',
    email: 'owner@tristarfitness.com',
    role: 'owner',
    name: 'Nikhil Verma',
    phone: '+91 98765 43213',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '6',
    username: 'raj',
    email: 'raj@tristarfitness.com',
    role: 'semi-admin',
    name: 'Raj Kumar',
    phone: '+91 98765 43214',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  }
];

// Simple password storage (in real app, use proper hashing)
const userPasswords: Record<string, string> = {
  'owner': 'demo123',
  'nikhil': 'demo123',
  'yash': 'demo123',
  'mohit': 'demo123',
  'palak': 'demo123',
  'raj': 'demo123',
};

// Global user data store for profile updates
let currentUserData: User[] = [...sampleUsers];

// Authentication functions
export const authenticateUser = (credentials: LoginCredentials): User | null => {
  const user = currentUserData.find(u => u.username === credentials.username);
  
  if (user && userPasswords[credentials.username] === credentials.password) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    return user;
  }
  
  return null;
};

export const getUserById = (id: string): User | null => {
  return currentUserData.find(u => u.id === id) || null;
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = currentUserData.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;
  
  // Update the user data
  currentUserData[userIndex] = { ...currentUserData[userIndex], ...updates };
  
  // Update localStorage
  localStorage.setItem('tristar_fitness_user', JSON.stringify(currentUserData[userIndex]));
  
  return currentUserData[userIndex];
};

export const getUserByUsername = (username: string): User | null => {
  return currentUserData.find(u => u.username === username) || null;
};

export const isOwner = (user: User | null): boolean => {
  return user?.role === 'owner';
};

export const isTrainer = (user: User | null): boolean => {
  return user?.role === 'trainer';
};

export const isSemiAdmin = (user: User | null): boolean => {
  return user?.role === 'semi-admin';
};

export const hasPermission = (user: User | null, requiredRole: 'owner' | 'trainer' | 'semi-admin'): boolean => {
  if (!user) return false;
  
  if (requiredRole === 'owner') {
    return user.role === 'owner';
  }
  
  if (requiredRole === 'semi-admin') {
    return user.role === 'semi-admin' || user.role === 'owner';
  }
  
  // Trainers can access trainer-level features
  return user.role === 'trainer' || user.role === 'owner' || user.role === 'semi-admin';
};
