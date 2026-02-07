export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userEmail: string;
  userId: string;
  roles: string[];
  accessTokenExpiresInSeconds: number;
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
  admin: {
    id: string;
    email: string;
    roles?: string[];
  };
  session: {
    accessTokenExpiresInSeconds: number;
  };
}

export interface AdminSessionApiData {
  authenticated: boolean;
  admin?: {
    id: string;
    email: string;
    roles?: string[];
  };
  session?: {
    accessTokenExpiresInSeconds?: number;
  };
}
