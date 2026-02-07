import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { authGuard } from './auth.guard';
import { environment } from '../../environments/environment';
import { vi } from 'vitest';

describe('authGuard', () => {
  const isAuthenticatedMock = vi.fn<() => boolean>();
  const authServiceMock = {
    isAuthenticated: isAuthenticatedMock,
  } as Pick<AuthService, 'isAuthenticated'>;
  let originalDevBypass: boolean;

  beforeEach(() => {
    originalDevBypass = environment.devBypassProtectedRoutes;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });
  });

  afterEach(() => {
    environment.devBypassProtectedRoutes = originalDevBypass;
    isAuthenticatedMock.mockReset();
  });

  it('should allow access when user is authenticated', () => {
    environment.devBypassProtectedRoutes = false;
    isAuthenticatedMock.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to login when user is not authenticated', () => {
    environment.devBypassProtectedRoutes = false;
    isAuthenticatedMock.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    const expectedUrlTree = TestBed.inject(Router).createUrlTree(['/login']);

    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe(expectedUrlTree.toString());
  });
});
