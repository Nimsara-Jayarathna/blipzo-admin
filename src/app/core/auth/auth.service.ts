import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import {
  AdminSessionApiData,
  AdminLoginApiData,
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
} from './models/auth.models';

const LOGIN_URL = adminApiUrl('auth/login');
const LOGOUT_URL = adminApiUrl('auth/logout');
const SESSION_URL = adminApiUrl('auth/session');

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    const email = payload.email.trim().toLowerCase();
    if (!email || !payload.password) {
      return throwError(() => new Error('Email and password are required.'));
    }

    return this.http
      .post<ApiSuccessResponse<AdminLoginApiData>>(
        LOGIN_URL,
        { email, password: payload.password },
        { withCredentials: true },
      )
      .pipe(
        map((response) => this.normalizeLoginResponse(response)),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.extractErrorMessage(error))),
        ),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(LOGOUT_URL, {}, { withCredentials: true });
  }

  checkSession(): Observable<boolean> {
    return this.http
      .get<ApiSuccessResponse<AdminSessionApiData>>(SESSION_URL, { withCredentials: true })
      .pipe(
        map((response) => Boolean(response.data.authenticated)),
        catchError(() => of(false)),
      );
  }

  private normalizeLoginResponse(
    response: ApiSuccessResponse<AdminLoginApiData>,
  ): LoginResponse {
    const payload = response.data;
    return {
      userEmail: payload.admin.email,
      userId: payload.admin.id,
      roles: payload.admin.roles ?? [],
      accessTokenExpiresInSeconds: payload.session.accessTokenExpiresInSeconds,
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
