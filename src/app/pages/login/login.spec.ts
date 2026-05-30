import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { AuthService } from '../../core/auth/auth.service';
import { LoginResponse } from '../../core/auth/models/auth.models';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  const loginMock = vi.fn();
  const authServiceMock = {
    login: loginMock,
  } as Pick<AuthService, 'login'>;

  beforeEach(async () => {
    loginMock.mockReset();

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
    const loginSubject = new Subject<LoginResponse>();
    const response: LoginResponse = {
      userEmail: 'admin@enterprise.com',
      userId: 'admin-1',
      roles: ['super_admin'],
      accessTokenExpiresInSeconds: 900,
    };
    loginMock.mockReturnValue(loginSubject.asObservable());

    component.loginForm.setValue({
      email: 'admin@enterprise.com',
      password: 'password123',
    });

    component.onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(component.loginState).toBe('loading');
    expect(navigateSpy).not.toHaveBeenCalled();

    loginSubject.next(response);
    loginSubject.complete();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error state for incorrect credentials', async () => {
    loginMock.mockReturnValue(throwError(() => new Error('Incorrect email or password.')));

    component.loginForm.setValue({
      email: 'admin@enterprise.com',
      password: 'wrong-pass',
    });

    component.onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(component.loginState).toBe('error');
    expect(component.errorMessage).toBe('Incorrect email or password.');
    expect(component.loginForm.disabled).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should show loading state while request is processing', async () => {
    const pendingLogin = new Subject<LoginResponse>();
    loginMock.mockReturnValue(pendingLogin.asObservable());

    component.loginForm.setValue({
      email: 'admin@enterprise.com',
      password: 'password123',
    });

    component.onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(component.loginState).toBe('loading');
    expect(component.loginForm.disabled).toBe(true);

    pendingLogin.complete();
    await fixture.whenStable();
  });
});
