import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import {
  ApiSuccessResponse,
  DashboardSnapshot,
  DashboardSnapshotQuery,
} from './models/dashboard.models';

const DASHBOARD_SNAPSHOT_URL = adminApiUrl('dashboard');

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getSnapshot(query: DashboardSnapshotQuery = {}): Observable<DashboardSnapshot> {
    let params = new HttpParams();

    if (query.period) {
      params = params.set('period', query.period);
    }

    if (query.eventsLimit !== undefined) {
      params = params.set('eventsLimit', String(query.eventsLimit));
    }

    return this.http
      .get<ApiSuccessResponse<DashboardSnapshot>>(DASHBOARD_SNAPSHOT_URL, {
        params,
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading dashboard...'),
      })
      .pipe(map((response) => response.data));
  }
}