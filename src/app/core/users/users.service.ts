import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import { AdminUsersData, ApiSuccessResponse } from './models/users.models';

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
}
