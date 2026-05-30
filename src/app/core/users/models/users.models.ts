export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

export interface AdminUsersData {
  users: AdminUser[];
  total: number;
}

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  categoryLimit: number;
  defaultCurrency: string;
  createdAt: string;
  lastLoginAt: string | null;
  role: string;
}

export interface AdminUserActivityItem {
  event: string;
  details: string;
  date: string;
}

export interface AdminUserActivityData {
  activity: AdminUserActivityItem[];
}

export interface UpdateAdminUserPayload {
  email?: string;
  status?: UserStatus;
  categoryLimit?: number;
}

export interface AdminUserResetPasswordData {
  userId: string;
  email: string;
}

export interface AdminUserForceLogoutData {
  userId: string;
  tokenVersion: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}
