import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request aggregated dashboard snapshot with credentials and query params', async () => {
    const promise = firstValueFrom(
      service.getSnapshot({
        period: '30d',
        eventsLimit: 6,
      }),
    );

    const request = httpMock.expectOne(
      (req) =>
        req.url === adminApiUrl('dashboard') &&
        req.params.get('period') === '30d' &&
        req.params.get('eventsLimit') === '6',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({
      success: true,
      message: 'Dashboard snapshot loaded.',
      data: {
        summary: {
          totalUsers: { value: 12450, deltaPct: 12 },
          activeUsers: { value: 1102, deltaPct: 5 },
          defaultCurrency: { value: 'USD', deltaPct: 0 },
          errorCount: { value: 14, deltaPct: -2 },
        },
        currencyUsage: {
          period: '30d',
          totalAmount: 1200000,
          segments: [
            { code: 'USD', percent: 70, amount: 840000 },
            { code: 'EUR', percent: 20, amount: 240000 },
            { code: 'OTHER', percent: 10, amount: 120000 },
          ],
        },
        recentEvents: [
          { level: 'ERROR', message: 'DB Connection Timeout', occurredAt: '2m ago' },
        ],
      },
    });

    await expect(promise).resolves.toMatchObject({
      summary: {
        totalUsers: { value: 12450, deltaPct: 12 },
      },
      currencyUsage: {
        period: '30d',
      },
    });
  });
});
