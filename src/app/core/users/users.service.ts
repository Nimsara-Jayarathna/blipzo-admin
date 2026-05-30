import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import {
  AdminUserActivityData,
  AdminUserForceLogoutData,
  AdminUserProfile,
  AdminUserResetPasswordData,
  AdminUsersData,
  ApiSuccessResponse,
  UpdateAdminUserPayload,
} from './models/users.models';

const USERS_URL = adminApiUrl('users');

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<AdminUsersData> {
    return this.http
      .get<ApiSuccessResponse<AdminUsersData>>(USERS_URL, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading users...'),
      })
      .pipe(
        map((response) => ({
          users: response.data.users ?? [],
          total: response.data.total ?? response.data.users?.length ?? 0,
        })),
      );
  }

  getUserById(userId: string): Observable<AdminUserProfile> {
    return this.http
      .get<ApiSuccessResponse<AdminUserProfile>>(adminApiUrl(`users/${userId}`), {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading user profile...'),
      })
      .pipe(map((response) => response.data));
  }

  updateUser(userId: string, payload: UpdateAdminUserPayload): Observable<AdminUserProfile> {
    return this.http
      .patch<ApiSuccessResponse<AdminUserProfile>>(adminApiUrl(`users/${userId}`), payload, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Saving user changes...'),
      })
      .pipe(map((response) => response.data));
  }

  resetUserPassword(userId: string): Observable<AdminUserResetPasswordData> {
    return this.http
      .post<ApiSuccessResponse<AdminUserResetPasswordData>>(
        adminApiUrl(`users/${userId}/reset-password`),
        {},
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Resetting password...'),
        },
      )
      .pipe(map((response) => response.data));
  }

  forceLogoutUser(userId: string): Observable<AdminUserForceLogoutData> {
    return this.http
      .post<ApiSuccessResponse<AdminUserForceLogoutData>>(
        adminApiUrl(`users/${userId}/force-logout`),
        {},
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Forcing logout...'),
        },
      )
      .pipe(map((response) => response.data));
  }

  getUserActivity(userId: string): Observable<AdminUserActivityData> {
    return this.http
      .get<ApiSuccessResponse<AdminUserActivityData>>(adminApiUrl(`users/${userId}/activity`), {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading user activity...'),
      })
      .pipe(map((response) => response.data));
  }
}
