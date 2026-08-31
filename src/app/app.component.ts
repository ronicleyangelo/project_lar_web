import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  authPage: 'login' | 'register' | 'complete-google' | null = null;
  private userSub!: Subscription;
  private routeSub!: Subscription;

  constructor(private authService: AuthService, private router: Router, private translate: TranslateService) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('appLang') || 'pt';
    this.translate.use(savedLang);

    this.userSub = this.authService.currentUser$.subscribe(
      (user) => this.currentUser = user
    );
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
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    });
  }

  private updateAuthPage(url: string): void {
    if (url.startsWith('/auth/login')) {
      this.authPage = 'login';
    } else if (url.startsWith('/auth/register')) {
      this.authPage = 'register';
    } else if (url.startsWith('/auth/complete-google') || url.startsWith('/auth/completar-google')) {
      this.authPage = 'complete-google';
    } else {
      this.authPage = null;
    }
  }
}
