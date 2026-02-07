import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { Login } from './login';
import { AuthService } from '../../core/auth/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: AuthService;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    const loginSpy = vi.spyOn(authService, 'login');

    component.onSubmit();

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard after successful login', async () => {
    component.loginForm.setValue({
      email: 'admin@enterprise.com',
      password: 'password123',
    });

    component.onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
