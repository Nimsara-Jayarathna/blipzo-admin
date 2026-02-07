import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { LoginRequest, LoginResponse } from './models/auth.models';

const SESSION_KEY = 'adminAuthToken';
const EMAIL_KEY = 'adminAuthEmail';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(payload: LoginRequest): Observable<LoginResponse> {
    const email = payload.email.trim().toLowerCase();

    if (!email || !payload.password) {
      return throwError(() => new Error('Email and password are required.'));
    }

    const response: LoginResponse = {
      accessToken: this.createToken(email),
      userEmail: email,
    };

    this.persistSession(response);
    return of(response).pipe(delay(250));
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(SESSION_KEY));
  }

  getUserEmail(): string | null {
    return localStorage.getItem(EMAIL_KEY);
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(SESSION_KEY, response.accessToken);
    localStorage.setItem(EMAIL_KEY, response.userEmail);
  }

  private createToken(email: string): string {
    return btoa(`${email}:${Date.now()}`);
  }
}
