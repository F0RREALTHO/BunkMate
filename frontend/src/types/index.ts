export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  userId: number;
}

export interface SubjectResponse {
  id: number;
  name: string;
  code: string | null;
  requiredPercentage: number;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number | null;
  classesCanSkip: number;
  classesNeeded: number;
  status: 'SAFE' | 'WARNING' | 'DANGER';
  statusMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardResponse {
  userName: string;
  overallPercentage: number | null;
  totalAttended: number;
  totalClasses: number;
  subjects: SubjectResponse[];
}

export interface AttendanceRecordResponse {
  id: number;
  subjectId: number;
  status: 'PRESENT' | 'ABSENT';
  occurredAt: string;
  idempotencyKey: string;
}

export interface ApiError {
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp: string;
}

export interface CreateSubjectRequest {
  name: string;
  code?: string;
  requiredPercentage: number;
  attendedClasses?: number;
  totalClasses?: number;
}

export interface UpdateSubjectRequest {
  name: string;
  code?: string;
  requiredPercentage?: number;
}
