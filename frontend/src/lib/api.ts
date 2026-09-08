import type {
  AuthResponse,
  DashboardResponse,
  SubjectResponse,
  AttendanceRecordResponse,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  ApiError,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: 'UNKNOWN',
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        };
      }
      throw { status: response.status, ...errorData };
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  // Auth
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<{ id: number; name: string; email: string }> {
    return this.request('/auth/me');
  }

  async updateMe(name: string): Promise<{ id: number; name: string; email: string }> {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardResponse> {
    return this.request('/subjects');
  }

  // Subjects
  async createSubject(data: CreateSubjectRequest): Promise<SubjectResponse> {
    return this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSubject(id: number): Promise<SubjectResponse> {
    return this.request(`/subjects/${id}`);
  }

  async updateSubject(id: number, data: UpdateSubjectRequest): Promise<SubjectResponse> {
    return this.request(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: number): Promise<void> {
    return this.request(`/subjects/${id}`, { method: 'DELETE' });
  }

  async resetSubject(id: number): Promise<SubjectResponse> {
    return this.request(`/subjects/${id}/reset`, { method: 'POST' });
  }

  // Attendance
  async recordAttendance(
    subjectId: number,
    status: 'PRESENT' | 'ABSENT',
    idempotencyKey: string
  ): Promise<SubjectResponse> {
    return this.request(`/subjects/${subjectId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ status, idempotencyKey }),
    });
  }

  async undoLatestAttendance(subjectId: number, status: 'PRESENT' | 'ABSENT'): Promise<SubjectResponse> {
    return this.request(`/subjects/${subjectId}/attendance/latest?status=${status}`, {
      method: 'DELETE',
    });
  }

  async undoAttendance(subjectId: number, recordId: number): Promise<SubjectResponse> {
    return this.request(`/subjects/${subjectId}/attendance/${recordId}`, {
      method: 'DELETE',
    });
  }

  async getHistory(subjectId: number): Promise<AttendanceRecordResponse[]> {
    return this.request(`/subjects/${subjectId}/attendance`);
  }

  async getAllHistory(): Promise<AttendanceRecordResponse[]> {
    return this.request('/history');
  }
}

export const api = new ApiClient();
