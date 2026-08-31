import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    req = req.clone({
      withCredentials: true,
      ...(token ? {
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      } : {}),
    });

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isGoogleOnboarding = req.url.includes('/auth/google/complete');
        const isAccountSecurityAction = req.url.includes('/account/password') || req.url.includes('/account/deletion');
        const isAnonymousSessionProbe = req.url.includes('/auth/me') && !this.authService.currentUserValue;
        if (error.status === 401 && !isGoogleOnboarding && !isAccountSecurityAction && !isAnonymousSessionProbe) {
          this.authService.logout().subscribe();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
