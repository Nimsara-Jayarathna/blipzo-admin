import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  if (environment.devBypassProtectedRoutes) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  return authService
    .checkSession()
    .pipe(map((authenticated) => (authenticated ? true : router.createUrlTree(['/login']))));
};
