import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const currentUser = this.authService.currentUserValue;
    const expectedRole = route.data['role'];

    if (currentUser && currentUser.role === expectedRole) {
      return true;
    }

    if (currentUser?.role === 'CLIENT') return this.router.createUrlTree(['/explore']);
    if (currentUser?.role === 'PROVIDER') return this.router.createUrlTree(['/provider/opportunities']);
    if (currentUser?.role === 'ADMIN') return this.router.createUrlTree(['/admin']);
    return this.router.createUrlTree(['/auth/login']);
  }
}
