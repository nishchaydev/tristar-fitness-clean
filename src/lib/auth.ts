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

// Production users for TriStar Fitness
export const sampleUsers: User[] = [
  {
    id: '1',
    username: 'nikhil@tristar',
    email: 'nikhil@tristar.com',
    role: 'owner',
    name: 'Nikhil Verma',
    phone: '+91 98765 43210',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'manager@tristar',
    email: 'manager@tristar.com',
    role: 'semi-admin',
    name: 'Manager',
    phone: '+91 98765 43211',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  }
];

// Production passwords for TriStar Fitness
const userPasswords: Record<string, string> = {
  'nikhil@tristar': 'nikhilverma@tristar',
  'manager@tristar': 'manager@tristarfitness',
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

export const isManager = (user: User | null): boolean => {
  return user?.role === 'semi-admin' || user?.role === 'owner';
};

export const hasPermission = (user: User | null, requiredRole: 'owner' | 'trainer' | 'semi-admin'): boolean => {
  if (!user) return false;
  
  // Normalize backend 'manager' to 'semi-admin'
  const role = (user.role as any) === 'manager' ? 'semi-admin' : user.role

  if (requiredRole === 'owner') {
    return role === 'owner';
  }
  
  if (requiredRole === 'semi-admin') {
    return role === 'semi-admin' || role === 'owner';
  }
  
  // Trainers can access trainer-level features
  return role === 'trainer' || role === 'owner' || role === 'semi-admin';
};
