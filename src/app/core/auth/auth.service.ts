import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import {
  AdminLoginApiData,
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
} from './models/auth.models';

const SESSION_KEY = 'adminAuthSession';
const LOGIN_URL = adminApiUrl('auth/login');

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    const email = payload.email.trim().toLowerCase();
    if (!email || !payload.password) {
      return throwError(() => new Error('Email and password are required.'));
    }

    return this.http
      .post<ApiSuccessResponse<AdminLoginApiData>>(LOGIN_URL, { email, password: payload.password })
      .pipe(
        map((response) => this.normalizeLoginResponse(response)),
        map((response) => {
          this.persistSession(response);
          return response;
        }),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.extractErrorMessage(error))),
        ),
      );
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getStoredSession()?.accessToken);
  }

  getUserEmail(): string | null {
    return this.getStoredSession()?.userEmail ?? null;
  }

  getAccessToken(): string | null {
    return this.getStoredSession()?.accessToken ?? null;
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(response));
  }

  private getStoredSession(): LoginResponse | null {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as LoginResponse;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  private normalizeLoginResponse(
    response: ApiSuccessResponse<AdminLoginApiData>,
  ): LoginResponse {
    const payload = response.data;
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      tokenType: payload.tokenType ?? 'Bearer',
      expiresIn: payload.expiresIn ?? 3600,
      userEmail: payload.admin.email,
      userId: payload.admin.id,
      roles: payload.admin.roles ?? [],
    };
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const fallbackMessage = 'Unable to sign in. Please verify your credentials and try again.';
    if (!error.error) {
      return fallbackMessage;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    const apiError = error.error as Partial<ApiErrorResponse>;
    return apiError.message || fallbackMessage;
  }
}
