import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  authPage: 'login' | 'register' | null = null;
  private userSub!: Subscription;
  private routeSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(
      (user) => this.currentUser = user
    );
    this.authService.restoreSession().subscribe();
    this.updateAuthPage(this.router.url);
    this.routeSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => this.updateAuthPage(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  onLogout(): void {
    this.authService.logout();
  }

  private updateAuthPage(url: string): void {
    if (url.startsWith('/auth/login')) {
      this.authPage = 'login';
    } else if (url.startsWith('/auth/register')) {
      this.authPage = 'register';
    } else {
      this.authPage = null;
    }
  }
}
