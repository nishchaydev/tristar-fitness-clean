// API Client for TriStar Fitness Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
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
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/api/members?${queryParams.toString()}`);
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

  async getExpiringMembers(days: number = 30): Promise<ApiResponse> {
    return this.request(`/api/members/expiring/soon?days=${days}`);
  }

  async checkInMember(id: string): Promise<ApiResponse> {
    return this.request(`/api/members/${id}/checkin`, {
      method: 'POST',
    });
  }

  async renewMembership(id: string, data: any): Promise<ApiResponse> {
    return this.request(`/api/members/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMemberStats(id: string): Promise<ApiResponse> {
    return this.request(`/api/members/${id}/stats`);
  }

  // Trainers
  async getTrainers(): Promise<ApiResponse> {
    return this.request('/api/trainers');
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

  async checkInTrainer(id: string): Promise<ApiResponse> {
    return this.request(`/api/trainers/${id}/checkin`, {
      method: 'POST',
    });
  }

  async checkOutTrainer(id: string): Promise<ApiResponse> {
    return this.request(`/api/trainers/${id}/checkout`, {
      method: 'POST',
    });
  }

  // Visitors
  async getVisitors(): Promise<ApiResponse> {
    return this.request('/api/visitors');
  }

  async checkInVisitor(visitorData: any): Promise<ApiResponse> {
    return this.request('/api/visitors/checkin', {
      method: 'POST',
      body: JSON.stringify(visitorData),
    });
  }

  async checkOutVisitor(id: string): Promise<ApiResponse> {
    return this.request(`/api/visitors/${id}/checkout`, {
      method: 'POST',
    });
  }

  // Invoices
  async getInvoices(): Promise<ApiResponse> {
    return this.request('/api/invoices');
  }

  async getInvoice(id: string): Promise<ApiResponse> {
    return this.request(`/api/invoices/${id}`);
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

  async getInvoiceStats(): Promise<ApiResponse> {
    return this.request('/api/invoices/stats');
  }

  // Sessions
  async getSessions(): Promise<ApiResponse> {
    return this.request('/api/sessions');
  }

  async getSession(id: string): Promise<ApiResponse> {
    return this.request(`/api/sessions/${id}`);
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

  async updateSessionStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/api/sessions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Follow-ups
  async getFollowUps(): Promise<ApiResponse> {
    return this.request('/api/followups');
  }

  async getFollowUp(id: string): Promise<ApiResponse> {
    return this.request(`/api/followups/${id}`);
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

  async updateFollowUpStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/api/followups/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getPendingFollowUps(): Promise<ApiResponse> {
    return this.request('/api/followups/pending');
  }

  // Activities
  async getActivities(): Promise<ApiResponse> {
    return this.request('/api/activities');
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
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { ApiResponse, ApiError };

// Utility function to check if backend is available
export const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.warn('Backend not available:', error);
    return false;
  }
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

