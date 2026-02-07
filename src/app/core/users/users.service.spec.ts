import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request users list with credentials', async () => {
    const promise = firstValueFrom(service.getUsers());

    const request = httpMock.expectOne(adminApiUrl('users'));
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.context.get(HTTP_REQUEST_LOADING_MESSAGE)).toBe('Loading users...');

    request.flush({
      success: true,
      message: 'Users loaded.',
      data: {
        users: [
          {
            id: '1001',
            name: 'Johnathan Doe',
            email: 'j.doe@example.com',
            status: 'ACTIVE',
          },
        ],
        total: 1,
      },
    });

    await expect(promise).resolves.toEqual({
      users: [
        {
          id: '1001',
          name: 'Johnathan Doe',
          email: 'j.doe@example.com',
          status: 'ACTIVE',
        },
      ],
      total: 1,
    });
  });

  it('should request user profile by id', async () => {
    const promise = firstValueFrom(service.getUserById('1002'));

    const request = httpMock.expectOne(adminApiUrl('users/1002'));
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);

    request.flush({
      success: true,
      message: 'User loaded.',
      data: {
        id: '1002',
        name: 'Jane Smith',
        email: 'jane.smith@blipzo.io',
        status: 'ACTIVE',
        categoryLimit: 10,
        defaultCurrency: 'USD ($)',
        createdAt: '2026-02-07T00:00:00.000Z',
        lastLoginAt: null,
        role: 'CONSUMER',
      },
    });

    await expect(promise).resolves.toEqual({
      id: '1002',
      name: 'Jane Smith',
      email: 'jane.smith@blipzo.io',
      status: 'ACTIVE',
      categoryLimit: 10,
      defaultCurrency: 'USD ($)',
      createdAt: '2026-02-07T00:00:00.000Z',
      lastLoginAt: null,
      role: 'CONSUMER',
    });
  });

  it('should call reset-password action endpoint', async () => {
    const promise = firstValueFrom(service.resetUserPassword('1002'));

    const request = httpMock.expectOne(adminApiUrl('users/1002/reset-password'));
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);

    request.flush({
      success: true,
      message: 'Password reset completed and temporary password emailed.',
      data: {
        userId: '1002',
        email: 'jane.smith@blipzo.io',
      },
    });

    await expect(promise).resolves.toEqual({
      userId: '1002',
      email: 'jane.smith@blipzo.io',
    });
  });
});
