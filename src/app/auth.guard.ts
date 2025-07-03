import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { onAuthStateChanged } from 'firebase/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean | import('@angular/router').UrlTree>(resolve => {
    onAuthStateChanged(auth, user => {
      if (user) {
        resolve(true);
      } else {
        resolve(router.createUrlTree(['/login']));
      }
    });
  });
};
