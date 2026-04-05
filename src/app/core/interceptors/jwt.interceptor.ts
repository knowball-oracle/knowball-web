import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const isPublicRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const authReq =
    token && !isPublicRoute
      ? req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }

      if (error.status === 403) {
        router.navigate(['/dashboard']);
      }

      return throwError(() => error);
    }),
  );
};
