import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { Auth, user } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const user$ = user(auth);
  const router = inject(Router);

  // Allow scoreboard access without authentication
  if (route.routeConfig?.path === 'scoreboard/:id') {
    return true;
  }

  return user$.pipe(
    map((user) => {
      // Allow authenticated users
      if (user) {
        return true;
      }
      
      // Redirect to login if no valid authentication
      router.navigate(['']);
      return false;
    })
  );
};
