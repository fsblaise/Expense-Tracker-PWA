import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = await authService.getLoggedInUser();
  // console.log(user);
  
  if (user !== null) {
    if(route.url[0].path === 'welcome' || route.url[0].path === 'login' || route.url[0].path === 'signup') {
      router.navigateByUrl('/main');
    return false;
    }
    return true;
  } else {
    if(route.url[0].path === 'welcome' || route.url[0].path === 'login' || route.url[0].path === 'signup') {
      return true;
    }
    router.navigateByUrl('/');
    return false;
  }
};
