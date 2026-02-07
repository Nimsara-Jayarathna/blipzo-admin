import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { authGuard } from './auth.guard';
import { environment } from '../../environments/environment';
import { vi } from 'vitest';

describe('authGuard', () => {
  const checkSessionMock = vi.fn();
  const authServiceMock = {
    checkSession: checkSessionMock,
  } as Pick<AuthService, 'checkSession'>;
  let originalDevBypass: boolean;

  beforeEach(() => {
    originalDevBypass = environment.devBypassProtectedRoutes;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });
  });

  afterEach(() => {
    environment.devBypassProtectedRoutes = originalDevBypass;
    checkSessionMock.mockReset();
  });

  it('should allow access when user is authenticated', async () => {
    environment.devBypassProtectedRoutes = false;
    checkSessionMock.mockReturnValue(of(true));

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    const resolved = await firstValueFrom(result as Observable<boolean | UrlTree>);

    expect(resolved).toBe(true);
  });

  it('should redirect to login when user is not authenticated', async () => {
    environment.devBypassProtectedRoutes = false;
    checkSessionMock.mockReturnValue(of(false));

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    const resolved = await firstValueFrom(result as Observable<boolean | UrlTree>);
    const expectedUrlTree = TestBed.inject(Router).createUrlTree(['/login']);

    expect(resolved instanceof UrlTree).toBe(true);
    expect((resolved as UrlTree).toString()).toBe(expectedUrlTree.toString());
  });
});
