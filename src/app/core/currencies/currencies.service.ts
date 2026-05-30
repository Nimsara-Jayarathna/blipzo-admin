import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import {
  AdminCurrenciesData,
  AdminCurrency,
  ApiSuccessResponse,
  CurrencyFormPayload,
} from './models/currencies.models';

const CURRENCIES_URL = adminApiUrl('currencies');

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  constructor(private readonly http: HttpClient) {}

  getCurrencies(): Observable<AdminCurrenciesData> {
    return this.http
      .get<ApiSuccessResponse<AdminCurrenciesData>>(CURRENCIES_URL, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading currencies...'),
      })
      .pipe(
        map((response) => ({
          currencies: response.data.currencies ?? [],
          total: response.data.total ?? response.data.currencies?.length ?? 0,
        })),
      );
  }

  getCurrencyById(currencyId: string): Observable<AdminCurrency> {
    return this.http
      .get<ApiSuccessResponse<AdminCurrency>>(adminApiUrl(`currencies/${currencyId}`), {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading currency...'),
      })
      .pipe(map((response) => response.data));
  }

  createCurrency(payload: CurrencyFormPayload): Observable<AdminCurrency> {
    return this.http
      .post<ApiSuccessResponse<AdminCurrency>>(CURRENCIES_URL, payload, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Creating currency...'),
      })
      .pipe(map((response) => response.data));
  }

  updateCurrency(currencyId: string, payload: CurrencyFormPayload): Observable<AdminCurrency> {
    return this.http
      .patch<ApiSuccessResponse<AdminCurrency>>(adminApiUrl(`currencies/${currencyId}`), payload, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Saving currency...'),
      })
      .pipe(map((response) => response.data));
  }

  setDefault(currencyId: string): Observable<AdminCurrency> {
    return this.http
      .post<ApiSuccessResponse<AdminCurrency>>(
        adminApiUrl(`currencies/${currencyId}/set-default`),
        {},
        {
          withCredentials: true,
          context: new HttpContext().set(
            HTTP_REQUEST_LOADING_MESSAGE,
            'Updating default currency...',
          ),
        },
      )
      .pipe(map((response) => response.data));
  }

  toggleStatus(currencyId: string, isActive: boolean): Observable<AdminCurrency> {
    return this.http
      .post<ApiSuccessResponse<AdminCurrency>>(
        adminApiUrl(`currencies/${currencyId}/toggle-status`),
        { isActive },
        {
          withCredentials: true,
          context: new HttpContext().set(
            HTTP_REQUEST_LOADING_MESSAGE,
            'Updating currency status...',
          ),
        },
      )
      .pipe(map((response) => response.data));
  }
}
