import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { CurrenciesService } from './currencies.service';

describe('CurrenciesService', () => {
  let service: CurrenciesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CurrenciesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request currencies list with credentials', async () => {
    const promise = firstValueFrom(service.getCurrencies());

    const request = httpMock.expectOne(adminApiUrl('currencies'));
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);

    request.flush({
      success: true,
      message: 'Currencies loaded.',
      data: {
        currencies: [
          {
            id: 'cur-usd',
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
            isActive: true,
            isDefault: true,
            status: 'DEFAULT',
          },
        ],
        total: 1,
      },
    });

    await expect(promise).resolves.toEqual({
      currencies: [
        {
          id: 'cur-usd',
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          isActive: true,
          isDefault: true,
          status: 'DEFAULT',
        },
      ],
      total: 1,
    });
  });
});
