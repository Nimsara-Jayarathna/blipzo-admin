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

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}
