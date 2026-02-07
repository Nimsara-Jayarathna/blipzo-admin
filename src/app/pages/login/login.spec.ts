import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { AuthService } from '../../core/auth/auth.service';
import { LoginResponse } from '../../core/auth/models/auth.models';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  const checkSessionMock = vi.fn(() => of(false));
  const loginMock = vi.fn();
  const authServiceMock = {
    checkSession: checkSessionMock,
    login: loginMock,
  } as Pick<AuthService, 'checkSession' | 'login'>;

  beforeEach(async () => {
    checkSessionMock.mockReset();
    loginMock.mockReset();
    checkSessionMock.mockReturnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard after successful login', async () => {
    const response: LoginResponse = {
      userEmail: 'admin@enterprise.com',
      userId: 'admin-1',
      roles: ['super_admin'],
      accessTokenExpiresInSeconds: 900,
    };
    loginMock.mockReturnValue(of(response));

    component.loginForm.setValue({
      email: 'admin@enterprise.com',
      password: 'password123',
    });

    component.onSubmit();
    expect(component.loginState).toBe('success');
    expect(navigateSpy).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 1300));
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error state for incorrect credentials', () => {
    loginMock.mockReturnValue(throwError(() => new Error('Incorrect email or password.')));

    component.loginForm.setValue({
      email: 'admin@enterprise.com',
      password: 'wrong-pass',
    });

    component.onSubmit();

    expect(component.loginState).toBe('error');
    expect(component.errorMessage).toBe('Incorrect email or password.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
