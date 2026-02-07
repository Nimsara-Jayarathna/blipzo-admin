import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  if (environment.devBypassProtectedRoutes) {
    return true;
  }

  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};
