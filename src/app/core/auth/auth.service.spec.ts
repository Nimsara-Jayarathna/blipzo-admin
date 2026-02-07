import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import {
  HTTP_REQUEST_LOADING_MESSAGE,
  HTTP_REQUEST_SUCCESS_MESSAGE,
  SHOW_HTTP_REQUEST_SUCCESS,
  SKIP_HTTP_REQUEST_FEEDBACK,
} from '../http/http-request-feedback.context';
import { AuthService } from './auth.service';
import { ApiSuccessResponse, AdminLoginApiData } from './models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should authenticate user after login', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'admin@enterprise.com', password: 'password123' }),
    );

    const request = httpMock.expectOne(adminApiUrl('auth/login'));
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.context.get(HTTP_REQUEST_LOADING_MESSAGE)).toBe('Signing in...');
    request.flush(buildLoginSuccessResponse());

    const result = await loginPromise;
    expect(result.userEmail).toBe('admin@enterprise.com');
    expect(result.roles).toEqual(['super_admin']);
    expect(result.accessTokenExpiresInSeconds).toBe(900);
  });

  it('should send logout request with credentials', async () => {
    const logoutPromise = firstValueFrom(service.logout());
    const request = httpMock.expectOne(adminApiUrl('auth/logout'));
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.context.get(HTTP_REQUEST_LOADING_MESSAGE)).toBe('Signing out...');
    expect(request.request.context.get(SHOW_HTTP_REQUEST_SUCCESS)).toBe(true);
    expect(request.request.context.get(HTTP_REQUEST_SUCCESS_MESSAGE)).toBe('Signed out successfully.');
    request.flush({});
    await logoutPromise;
  });

  it('should return session true when backend confirms session', async () => {
    const sessionPromise = firstValueFrom(service.checkSession());
    const request = httpMock.expectOne(adminApiUrl('auth/session'));
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.context.get(SKIP_HTTP_REQUEST_FEEDBACK)).toBe(true);
    request.flush({
      success: true,
      message: 'Session active.',
      data: { authenticated: true },
    });

    await expect(sessionPromise).resolves.toBe(true);
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
  });

  it('should handle business error response even with 200 status', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'admin@enterprise.com', password: 'wrong-pass' }),
    );

    httpMock.expectOne(adminApiUrl('auth/login')).flush({
      success: false,
      message: 'Incorrect email or password.',
    });

    await expect(loginPromise).rejects.toThrow('Incorrect email or password.');
  });

  it('should return false when session check fails', async () => {
    const sessionPromise = firstValueFrom(service.checkSession());
    httpMock
      .expectOne(adminApiUrl('auth/session'))
      .flush({ success: false, message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    await expect(sessionPromise).resolves.toBe(false);
  });
});

function buildLoginSuccessResponse(): ApiSuccessResponse<AdminLoginApiData> {
  return {
    success: true,
    message: 'Login successful.',
    data: {
      admin: {
        id: 'admin-1',
        email: 'admin@enterprise.com',
        roles: ['super_admin'],
      },
      session: {
        accessTokenExpiresInSeconds: 900,
      },
    },
    meta: {
      requestId: 'req-001',
      timestamp: new Date().toISOString(),
    },
  };
}
