import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GuestHomeGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (this.authService.currentUserValue) return this.redirectForRole();
    return this.authService.restoreSession().pipe(map(() => this.redirectForRole()));
  }

  private redirectForRole(): boolean | UrlTree {
    const role = this.authService.currentUserValue?.role;
    if (role === 'CLIENT') return this.router.createUrlTree(['/explore']);
    if (role === 'PROVIDER') return this.router.createUrlTree(['/provider/opportunities']);
    if (role === 'ADMIN') return this.router.createUrlTree(['/admin']);
    return true;
  }
}
