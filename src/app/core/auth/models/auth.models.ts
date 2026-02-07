export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  userEmail: string;
  userId: string;
  roles: string[];
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

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface AdminLoginApiData {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  admin: {
    id: string;
    email: string;
    roles?: string[];
  };
}
