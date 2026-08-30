import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestHomeGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): boolean | UrlTree {
    const role = this.authService.currentUserValue?.role;
    if (role === 'CLIENT') return this.router.createUrlTree(['/explore']);
    if (role === 'PROVIDER') return this.router.createUrlTree(['/provider/opportunities']);
    if (role === 'ADMIN') return this.router.createUrlTree(['/admin']);
    return true;
  }
}
