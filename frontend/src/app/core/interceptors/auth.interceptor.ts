import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  // FIX: don't attach token to auth endpoints to avoid header pollution
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // FIX: only try refresh on 401, not on other errors
      if (
        error.status === 401 &&
        !req.url.includes('token/refresh') &&
        !req.url.includes('login') &&
        auth.getAccessToken()
      ) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access}` }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // FIX: logout cleanly if refresh also fails
            auth.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
