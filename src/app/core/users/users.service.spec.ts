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
});
