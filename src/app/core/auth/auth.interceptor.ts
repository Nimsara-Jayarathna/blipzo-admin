import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { adminApiUrl, isAdminApiUrl } from '../api/api-endpoints';
import { AuthService } from './auth.service';

const LOGIN_ENDPOINT = adminApiUrl('auth/login');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isAdminApiUrl(req.url) || req.url === LOGIN_ENDPOINT) {
    return next(req);
  }

  const token = inject(AuthService).getAccessToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
