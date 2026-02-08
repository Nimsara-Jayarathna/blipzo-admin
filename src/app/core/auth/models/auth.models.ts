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

export interface OtpChallengeStatus {
  challengeId: string;
  maskedEmail: string;
  otpExpiresInSeconds: number;
  remainingAttempts: number;
  maxAttempts: number;
  lockoutRemainingSeconds: number;
  resendAvailableInSeconds: number;
  status: 'pending' | 'locked' | 'expired' | 'consumed' | 'cancelled' | 'verified';
}

export interface OtpRequiredLoginResponse {
  otpRequired: true;
  challenge: OtpChallengeStatus;
}

export type LoginResult =
  | {
      kind: 'authenticated';
      data: LoginResponse;
    }
  | {
      kind: 'otp_required';
      data: OtpRequiredLoginResponse;
    };

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
  otpRequired?: boolean;
  challengeId?: string;
  maskedEmail?: string;
  otpExpiresInSeconds?: number;
  remainingAttempts?: number;
  maxAttempts?: number;
  lockoutRemainingSeconds?: number;
  resendAvailableInSeconds?: number;
  status?: OtpChallengeStatus['status'];
  admin?: {
    id: string;
    email: string;
    roles?: string[];
  };
  session?: {
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

export interface VerifyOtpRequest {
  otp: string;
}
