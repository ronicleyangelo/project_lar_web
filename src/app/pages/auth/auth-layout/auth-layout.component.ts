import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

type AuthPage = 'login' | 'register';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  authPage: AuthPage = 'login';
  private routeSubscription?: Subscription;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.setAuthPage(this.router.url);
    this.routeSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => this.setAuthPage(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private setAuthPage(url: string): void {
    this.authPage = url.includes('/register') ? 'register' : 'login';
  }
}
