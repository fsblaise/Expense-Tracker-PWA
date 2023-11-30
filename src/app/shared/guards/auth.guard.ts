import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.getLoggedInUser() !== null) {
    return true;
  } else {
    router.navigateByUrl('/');
    return false;
  }
};
