import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import {
  ApiSuccessResponse,
  BackupJob,
  DeleteRequestsResponse,
  ProviderUsageHistory,
  SystemSnapshot,
} from './models/system.models';

const SYSTEM_URL = adminApiUrl('system');

@Injectable({ providedIn: 'root' })
export class SystemService {
  constructor(private readonly http: HttpClient) {}

  getSnapshot(): Observable<SystemSnapshot> {
    return this.http
      .get<ApiSuccessResponse<SystemSnapshot>>(SYSTEM_URL, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading system snapshot...'),
      })
      .pipe(map((response) => response.data));
  }

  getProviderUsage(date?: string): Observable<ProviderUsageHistory> {
    const url = date ? adminApiUrl(`system/provider-usage?date=${encodeURIComponent(date)}`) : adminApiUrl('system/provider-usage');
    return this.http
      .get<ApiSuccessResponse<ProviderUsageHistory>>(url, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading provider usage...'),
      })
      .pipe(map((response) => response.data));
  }

  startBackup(): Observable<BackupJob> {
    return this.http
      .post<ApiSuccessResponse<BackupJob>>(
        adminApiUrl('system/backup/run'),
        {},
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Starting backup...'),
        },
      )
      .pipe(map((response) => response.data));
  }

  getBackup(backupId: string): Observable<BackupJob> {
    return this.http
      .get<ApiSuccessResponse<BackupJob>>(adminApiUrl(`system/backup/${backupId}`), {
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  cancelBackup(backupId: string): Observable<BackupJob> {
    return this.http
      .post<ApiSuccessResponse<BackupJob>>(
        adminApiUrl(`system/backup/${backupId}/cancel`),
        {},
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Canceling backup...'),
        },
      )
      .pipe(map((response) => response.data));
  }

  getBackupDownloadUrl(backupId: string): string {
    return adminApiUrl(`system/backup/${backupId}/download`);
  }

  getDeleteRequests(status?: 'pending' | 'approved' | 'denied'): Observable<DeleteRequestsResponse> {
    const url = status ? adminApiUrl(`system/delete-requests?status=${status}`) : adminApiUrl('system/delete-requests');
    return this.http
      .get<ApiSuccessResponse<DeleteRequestsResponse>>(url, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading delete requests...'),
      })
      .pipe(map((response) => response.data));
  }

  decideDeleteRequest(
    requestId: string,
    decision: 'approve' | 'deny',
    note?: string,
  ): Observable<{ id: string; status: 'pending' | 'approved' | 'denied' }> {
    return this.http
      .post<ApiSuccessResponse<{ id: string; status: 'pending' | 'approved' | 'denied' }>>(
        adminApiUrl(`system/delete-requests/${requestId}/decision`),
        { decision, note },
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Updating delete request...'),
        },
      )
      .pipe(map((response) => ({ id: response.data.id, status: response.data.status })));
  }
}
