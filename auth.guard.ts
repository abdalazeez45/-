import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const managerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[managerGuard] currentUser', authService.currentUser()?.phone, authService.currentUser()?.role, 'canAccess', authService.canAccessDashboard());
  if (authService.canAccessDashboard()) {
    return true;
  }

  // Redirect to home if not allowed
  router.navigate(['/']);
  return false;
};

export const driverGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isDriver()) {
    return true;
  }

  // Redirect to home if not a driver
  router.navigate(['/']);
  return false;
};
