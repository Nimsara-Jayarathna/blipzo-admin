import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should authenticate user after login', async () => {
    await firstValueFrom(service.login({ email: 'admin@enterprise.com', password: 'password123' }));

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getUserEmail()).toBe('admin@enterprise.com');
  });

  it('should clear session on logout', async () => {
    await firstValueFrom(service.login({ email: 'admin@enterprise.com', password: 'password123' }));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getUserEmail()).toBeNull();
  });
});
