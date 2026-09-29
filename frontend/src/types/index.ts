export type UserRole = 'admin' | 'faculty';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  faculty_id: number | null;
  hasHouse: boolean;
}

export interface Faculty {
  id: number;
  name: string;
  email: string;
  department: string;
  grade_id: number;
  contact: string;
  joined_since: string;
  grade_name?: string;
  grade_rank?: number;
}

export type HouseStatus = 'vacant' | 'occupied' | 'maintenance';

export interface House {
  id: number;
  house_number: string;
  address: string;
  capacity: number;
  status: HouseStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
  current_tenant?: {
    faculty_id: number;
    faculty_name: string;
    start_date: string;
  } | null;
}

export type ApplicationStatus = 'pending' | 'allocated' | 'rejected' | 'withdrawn';

export interface Application {
  id: number;
  faculty_id: number;
  house_id: number;
  status: ApplicationStatus;
  admin_notes: string | null;
  applied_at: string;
  updated_at: string;
  faculty_name?: string;
  faculty_email?: string;
  department?: string;
  grade_name?: string;
  grade_rank?: number;
  joined_since?: string;
  house_number?: string;
  house_address?: string;
}

export interface Tenancy {
  id: number;
  house_id: number;
  faculty_id: number;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  house_number?: string;
  house_address?: string;
  faculty_name?: string;
}

export type RequestPriority = 'low' | 'medium' | 'high' | 'emergency';
export type RequestStatus = 'pending' | 'in_progress' | 'resolved' | 'cancelled';

export interface MaintenanceCategory {
  id: number;
  name: string;
  default_priority: RequestPriority;
  description: string | null;
}

export interface MaintenanceRequest {
  id: number;
  user_id: number;
  house_id: number;
  category_id: number;
  problem: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  house_number?: string;
  house_address?: string;
  user_email?: string;
  faculty_name?: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  user_email?: string;
}

export interface AllocationCandidate {
  applicationId: number;
  facultyId: number;
  facultyName: string;
  department: string;
  gradeName: string;
  gradeRank: number;
  joinedSince: string;
  desiredHouseId: number;
  desiredHouseNumber: string;
  desiredHouseAddress: string;
}

export interface AllocationPreviewMatch {
  applicationId: number;
  facultyId: number;
  facultyName: string;
  gradeName: string;
  gradeRank: number;
  joinedSince: string;
  houseId: number;
  houseNumber: string;
  houseAddress: string;
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}
