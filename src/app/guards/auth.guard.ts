import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  if (environment.devBypassProtectedRoutes) {
    return true;
  }

  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  return isAuthenticated ? true : inject(Router).createUrlTree(['/login']);
};
