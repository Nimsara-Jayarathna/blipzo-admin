import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { AuthService } from './auth.service';
import { ApiSuccessResponse, AdminLoginApiData } from './models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should authenticate user after login', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'admin@enterprise.com', password: 'password123' }),
    );

    const request = httpMock.expectOne(adminApiUrl('auth/login'));
    expect(request.request.method).toBe('POST');
    request.flush(buildLoginSuccessResponse());

    const result = await loginPromise;
    expect(result.userEmail).toBe('admin@enterprise.com');
    expect(result.roles).toEqual(['super_admin']);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getUserEmail()).toBe('admin@enterprise.com');
  });

  it('should clear session on logout', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'admin@enterprise.com', password: 'password123' }),
    );
    httpMock.expectOne(adminApiUrl('auth/login')).flush(buildLoginSuccessResponse());
    await loginPromise;

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getUserEmail()).toBeNull();
  });

  it('should surface backend error message', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'admin@enterprise.com', password: 'wrong-pass' }),
    );

    httpMock.expectOne(adminApiUrl('auth/login')).flush(
      { success: false, message: 'Incorrect email or password.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    await expect(loginPromise).rejects.toThrow('Incorrect email or password.');
    expect(service.isAuthenticated()).toBe(false);
  });
});

function buildLoginSuccessResponse(): ApiSuccessResponse<AdminLoginApiData> {
  return {
    success: true,
    message: 'Login successful.',
    data: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      admin: {
        id: 'admin-1',
        email: 'admin@enterprise.com',
        roles: ['super_admin'],
      },
    },
    meta: {
      requestId: 'req-001',
      timestamp: new Date().toISOString(),
    },
  };
}
