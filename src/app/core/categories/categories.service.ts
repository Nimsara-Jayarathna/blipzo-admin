import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { adminApiUrl } from '../api/api-endpoints';
import { HTTP_REQUEST_LOADING_MESSAGE } from '../http/http-request-feedback.context';
import {
  AdminCategoriesData,
  AdminCategory,
  ApiSuccessResponse,
  SaveAdminCategoryPayload,
} from './models/categories.models';

const CATEGORIES_URL = adminApiUrl('categories');

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<AdminCategoriesData> {
    return this.http
      .get<ApiSuccessResponse<AdminCategoriesData>>(CATEGORIES_URL, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Loading categories...'),
      })
      .pipe(map((response) => response.data));
  }

  createCategory(payload: SaveAdminCategoryPayload): Observable<AdminCategory> {
    return this.http
      .post<ApiSuccessResponse<AdminCategory>>(CATEGORIES_URL, payload, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Creating category...'),
      })
      .pipe(map((response) => response.data));
  }

  updateCategory(categoryId: string, payload: SaveAdminCategoryPayload): Observable<AdminCategory> {
    return this.http
      .patch<ApiSuccessResponse<AdminCategory>>(adminApiUrl(`categories/${categoryId}`), payload, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Saving category...'),
      })
      .pipe(map((response) => response.data));
  }

  setDefaultCategory(categoryId: string): Observable<AdminCategory> {
    return this.http
      .post<ApiSuccessResponse<AdminCategory>>(adminApiUrl(`categories/${categoryId}/set-default`), {}, {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Updating default category...'),
      })
      .pipe(map((response) => response.data));
  }

  deleteCategory(categoryId: string): Observable<{ id: string; deleted: boolean }> {
    return this.http
      .delete<ApiSuccessResponse<{ id: string; deleted: boolean }>>(adminApiUrl(`categories/${categoryId}`), {
        withCredentials: true,
        context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Deleting category...'),
      })
      .pipe(map((response) => response.data));
  }

  updateGlobalCategoryLimit(defaultCategoryLimit: number): Observable<{ defaultCategoryLimit: number }> {
    return this.http
      .patch<ApiSuccessResponse<{ defaultCategoryLimit: number }>>(
        adminApiUrl('categories/settings'),
        { defaultCategoryLimit },
        {
          withCredentials: true,
          context: new HttpContext().set(HTTP_REQUEST_LOADING_MESSAGE, 'Updating category settings...'),
        },
      )
      .pipe(map((response) => response.data));
  }
}
