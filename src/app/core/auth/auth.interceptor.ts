import { HttpInterceptorFn } from '@angular/common/http';
import { isAdminApiUrl } from '../api/api-endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isAdminApiUrl(req.url) || req.withCredentials) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
