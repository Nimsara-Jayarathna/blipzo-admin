import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, TimeoutError, catchError, map, of, throwError, timeout } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import {
  HTTP_REQUEST_LOADING_MESSAGE,
  HTTP_REQUEST_SUCCESS_MESSAGE,
  SHOW_HTTP_REQUEST_SUCCESS,
  SKIP_HTTP_REQUEST_FEEDBACK,
} from '../http/http-request-feedback.context';
import {
  AdminSessionApiData,
  AdminLoginApiData,
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginResult,
  LoginRequest,
  LoginResponse,
  OtpChallengeStatus,
  VerifyOtpRequest,
} from './models/auth.models';

const LOGIN_URL = adminApiUrl('auth/login');
const OTP_VERIFY_URL = adminApiUrl('auth/otp/verify');
const OTP_RESEND_URL = adminApiUrl('auth/otp/resend');
const OTP_STATUS_URL = adminApiUrl('auth/otp/status');
const OTP_CANCEL_URL = adminApiUrl('auth/otp/cancel');
const LOGOUT_URL = adminApiUrl('auth/logout');
const SESSION_URL = adminApiUrl('auth/session');
const AUTH_REQUEST_TIMEOUT_MS = 10000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResult> {
    const email = payload.email.trim().toLowerCase();
    if (!email || !payload.password) {
      return throwError(() => new Error('Email and password are required.'));
    }

    return this.http
      .post<ApiSuccessResponse<AdminLoginApiData> | ApiErrorResponse>(
        LOGIN_URL,
        { email, password: payload.password },
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Signing in...'),
        },
      )
      .pipe(
        timeout(AUTH_REQUEST_TIMEOUT_MS),
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Unable to sign in. Please try again.');
          }

          return this.normalizeLoginResult(response);
        }),
        catchError((error: unknown) =>
          throwError(() => new Error(this.extractErrorMessage(error))),
        ),
      );
  }

  verifyOtp(payload: VerifyOtpRequest): Observable<LoginResponse> {
    const otp = payload.otp?.trim();
    if (!otp) {
      return throwError(() => new Error('OTP is required.'));
    }

    return this.http
      .post<ApiSuccessResponse<AdminLoginApiData> | ApiErrorResponse>(
        OTP_VERIFY_URL,
        { otp },
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Verifying code...'),
        },
      )
      .pipe(
        timeout(AUTH_REQUEST_TIMEOUT_MS),
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Unable to verify code.');
          }

          return this.normalizeAuthenticatedResponse(response);
        }),
        catchError((error: unknown) =>
          throwError(() => new Error(this.extractErrorMessage(error))),
        ),
      );
  }

  resendOtp(): Observable<OtpChallengeStatus> {
    return this.http
      .post<ApiSuccessResponse<AdminLoginApiData> | ApiErrorResponse>(
        OTP_RESEND_URL,
        {},
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Resending code...'),
        },
      )
      .pipe(
        timeout(AUTH_REQUEST_TIMEOUT_MS),
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Unable to resend verification code.');
          }
          return this.normalizeOtpChallenge(response.data);
        }),
      );
  }

  getOtpStatus(): Observable<OtpChallengeStatus> {
    return this.http
      .get<ApiSuccessResponse<AdminLoginApiData>>(OTP_STATUS_URL, {
        withCredentials: true,
        context: new HttpContext().set(SKIP_HTTP_REQUEST_FEEDBACK, true),
      })
      .pipe(
        timeout(AUTH_REQUEST_TIMEOUT_MS),
        map((response) => this.normalizeOtpChallenge(response.data)),
      );
  }

  cancelOtpChallenge(): Observable<void> {
    return this.http.post<void>(OTP_CANCEL_URL, {}, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      LOGOUT_URL,
      {},
      {
        withCredentials: true,
        context: new HttpContext()
          .set(HTTP_REQUEST_LOADING_MESSAGE, 'Signing out...')
          .set(SHOW_HTTP_REQUEST_SUCCESS, true)
          .set(HTTP_REQUEST_SUCCESS_MESSAGE, 'Signed out successfully.'),
      },
    );
  }

  checkSession(): Observable<boolean> {
    return this.http
      .get<ApiSuccessResponse<AdminSessionApiData>>(SESSION_URL, {
        withCredentials: true,
        context: new HttpContext().set(SKIP_HTTP_REQUEST_FEEDBACK, true),
      })
      .pipe(
        map((response) => Boolean(response.data.authenticated)),
        catchError(() => of(false)),
      );
  }

  private normalizeLoginResult(response: ApiSuccessResponse<AdminLoginApiData>): LoginResult {
    const payload = response.data;
    if (payload?.otpRequired) {
      return {
        kind: 'otp_required',
        data: {
          otpRequired: true,
          challenge: this.normalizeOtpChallenge(payload),
        },
      };
    }

    return {
      kind: 'authenticated',
      data: this.normalizeAuthenticatedResponse(response),
    };
  }

  private normalizeOtpChallenge(payload: Partial<AdminLoginApiData>): OtpChallengeStatus {
    if (
      !payload?.challengeId ||
      !payload?.maskedEmail ||
      payload.otpExpiresInSeconds == null ||
      payload.remainingAttempts == null ||
      payload.maxAttempts == null ||
      payload.lockoutRemainingSeconds == null ||
      payload.resendAvailableInSeconds == null ||
      !payload.status
    ) {
      throw new Error('Invalid OTP challenge response from server.');
    }

    return {
      challengeId: payload.challengeId,
      maskedEmail: payload.maskedEmail,
      otpExpiresInSeconds: payload.otpExpiresInSeconds,
      remainingAttempts: payload.remainingAttempts,
      maxAttempts: payload.maxAttempts,
      lockoutRemainingSeconds: payload.lockoutRemainingSeconds,
      resendAvailableInSeconds: payload.resendAvailableInSeconds,
      status: payload.status,
    };
  }

  private normalizeAuthenticatedResponse(
    response: ApiSuccessResponse<AdminLoginApiData>,
  ): LoginResponse {
    const payload = response.data;
    if (
      !payload?.admin?.id ||
      !payload?.admin?.email ||
      !payload?.session?.accessTokenExpiresInSeconds
    ) {
      throw new Error('Invalid login response from server.');
    }

    return {
      userEmail: payload.admin.email,
      userId: payload.admin.id,
      roles: payload.admin.roles ?? [],
      accessTokenExpiresInSeconds: payload.session.accessTokenExpiresInSeconds,
    };
  }

  private extractErrorMessage(error: unknown): string {
    const fallbackMessage = 'Unable to sign in. Please verify your credentials and try again.';
    if (error instanceof TimeoutError) {
      return 'Login request timed out. Please try again.';
    }

    if (error instanceof HttpErrorResponse) {
      if (!error.error) {
        return error.message || fallbackMessage;
      }

      if (typeof error.error === 'string') {
        return error.error || error.message || fallbackMessage;
      }

      const apiError = error.error as Partial<ApiErrorResponse> & {
        error?: { message?: string };
        details?: { message?: string };
      };
      return (
        apiError.message ||
        apiError.error?.message ||
        apiError.details?.message ||
        error.message ||
        fallbackMessage
      );
    }

    if (error instanceof Error) {
      return error.message || fallbackMessage;
    }

    return fallbackMessage;
  }
}
