// API Client for TriStar Fitness Backend
let API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:6868';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
  timestamp?: string;
}

interface ApiError {
  error: string;
  message: string;
  details?: any[];
  timestamp?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private isOnline: boolean = true;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    this.checkConnectivity();
  }

    setBaseURL(url: string) {
      this.baseURL = url;
    }

  private async checkConnectivity(): Promise<void> {
    const candidates = [
      this.baseURL,
      'http://localhost:6868',
      'http://127.0.0.1:6868',
      'http://localhost:5000'
    ];

    for (const base of candidates) {
      try {
        const response = await fetch(`${base}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          this.baseURL = base;
          API_BASE_URL = base;
          this.isOnline = true;
          return;
        }
      } catch {
        // try next candidate
      }
    }
    this.isOnline = false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) await this.checkConnectivity();
    if (!this.isOnline) throw new Error('Backend is not available');

    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown API error');
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse> {
    try {
      // Try demo-login first (works with SQLite setup)
      const response = await this.request('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.success && response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('tristar_fitness_user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.isOnline) {
        await this.request('/api/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/api/auth/me');
  }

  // Members
  async getMembers(params?: {
    status?: string;
    membershipType?: string;
    trainerId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getMember(id: string): Promise<ApiResponse> {
    return this.request(`/api/members/${id}`);
  }

  async createMember(memberData: any): Promise<ApiResponse> {
    return this.request('/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(id: string, memberData: any): Promise<ApiResponse> {
    return this.request(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse> {
    return this.request(`/api/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Trainers
  async getTrainers(params?: {
    status?: string;
    specialization?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/trainers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getTrainer(id: string): Promise<ApiResponse> {
    return this.request(`/api/trainers/${id}`);
  }

  async createTrainer(trainerData: any): Promise<ApiResponse> {
    return this.request('/api/trainers', {
      method: 'POST',
      body: JSON.stringify(trainerData),
    });
  }

  async updateTrainer(id: string, trainerData: any): Promise<ApiResponse> {
    return this.request(`/api/trainers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trainerData),
    });
  }

  async deleteTrainer(id: string): Promise<ApiResponse> {
    return this.request(`/api/trainers/${id}`, {
      method: 'DELETE',
    });
  }

  // Sessions
  async getSessions(params?: {
    trainerId?: string;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createSession(sessionData: any): Promise<ApiResponse> {
    return this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(id: string, sessionData: any): Promise<ApiResponse> {
    return this.request(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(id: string): Promise<ApiResponse> {
    return this.request(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Visitors
  async getVisitors(params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/visitors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createVisitor(visitorData: any): Promise<ApiResponse> {
    return this.request('/api/visitors', {
      method: 'POST',
      body: JSON.stringify(visitorData),
    });
  }

  async updateVisitor(id: string, visitorData: any): Promise<ApiResponse> {
    return this.request(`/api/visitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visitorData),
    });
  }

  async deleteVisitor(id: string): Promise<ApiResponse> {
    return this.request(`/api/visitors/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoices(params?: {
    status?: string;
    memberId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createInvoice(invoiceData: any): Promise<ApiResponse> {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: any): Promise<ApiResponse> {
    return this.request(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string): Promise<ApiResponse> {
    return this.request(`/api/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Follow-ups
  async getFollowUps(params?: {
    status?: string;
    memberId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/followups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createFollowUp(followUpData: any): Promise<ApiResponse> {
    return this.request('/api/followups', {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });
  }

  async updateFollowUp(id: string, followUpData: any): Promise<ApiResponse> {
    return this.request(`/api/followups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(followUpData),
    });
  }

  async deleteFollowUp(id: string): Promise<ApiResponse> {
    return this.request(`/api/followups/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(params?: {
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createActivity(activityData: any): Promise<ApiResponse> {
    return this.request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse> {
    return this.request('/api/analytics');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // API Info
  async getApiInfo(): Promise<ApiResponse> {
    return this.request('/api');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  isBackendAvailable(): boolean {
    return this.isOnline;
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { ApiResponse, ApiError };

// Utility function to check if backend is available (tries common ports)
export const checkBackendAvailability = async (): Promise<boolean> => {
  const candidates = [
    API_BASE_URL,
    'http://localhost:6868',
    'http://127.0.0.1:6868',
    'http://localhost:5000'
  ];
  for (const base of candidates) {
    try {
      const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        API_BASE_URL = base;
        apiClient.setBaseURL(base);
        return true;
      }
    } catch {
      // continue
    }
  }
  return false;
};

// Utility function to sync local data with backend
export const syncDataWithBackend = async () => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.log('Backend not available, using local data');
      return false;
    }

    // Sync data from backend
    const [members, trainers, invoices, activities] = await Promise.all([
      apiClient.getMembers(),
      apiClient.getTrainers(),
      apiClient.getInvoices(),
      apiClient.getActivities(),
    ]);

    // Update local storage with backend data
    if (members.success) {
      localStorage.setItem('tristar_members', JSON.stringify(members.data));
    }
    if (trainers.success) {
      localStorage.setItem('tristar_trainers', JSON.stringify(trainers.data));
    }
    if (invoices.success) {
      localStorage.setItem('tristar_invoices', JSON.stringify(invoices.data));
    }
    if (activities.success) {
      localStorage.setItem('tristar_activities', JSON.stringify(activities.data));
    }

    console.log('Data synced with backend successfully');
    return true;
  } catch (error) {
    console.error('Failed to sync with backend:', error);
    return false;
  }
};


