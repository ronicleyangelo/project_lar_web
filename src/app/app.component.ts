import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { APP_RELEASE } from './core/config/app-version';
import { LegalDialogService } from './core/services/legal-dialog.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MessageService } from 'primeng/api';
import { BetaService } from './core/services/beta.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly release = APP_RELEASE;
  currentUser: User | null = null;
  authPage: 'login' | 'register' | 'complete-google' | null = null;
  feedbackVisible = false;
  feedbackCategory = 'SUGGESTION';
  feedbackMessage = '';
  feedbackSending = false;
  private userSub!: Subscription;
  private routeSub!: Subscription;
  private updateSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private swUpdate: SwUpdate,
    private betaService: BetaService,
    private messageService: MessageService,
    public legalDialogs: LegalDialogService
  ) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('appLang') || 'pt';
    this.translate.use(savedLang);

    this.userSub = this.authService.currentUser$.subscribe(
      (user) => this.currentUser = user
    );
    this.updateAuthPage(this.router.url);
    this.routeSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.updateAuthPage(event.urlAfterRedirects);
      void this.checkForAppUpdate();
    });

    if (this.swUpdate.isEnabled) {
      this.updateSub = this.swUpdate.versionUpdates.pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')
      ).subscribe(() => {
        void this.swUpdate.activateUpdate().then(() => document.location.reload());
      });
      void this.checkForAppUpdate();
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.updateSub?.unsubscribe();
  }

  onLogout(): void {
    const serverLogout = this.authService.logout();
    void this.router.navigate(['/auth/login'], { replaceUrl: true }).then(() => {
      serverLogout.subscribe();
    });
  }

  sendBetaFeedback(): void {
    const message = this.feedbackMessage.trim();
    if (message.length < 5) {
      this.messageService.add({ severity: 'warn', summary: 'Feedback', detail: 'Conte um pouco mais sobre o que encontrou.' });
      return;
    }
    this.feedbackSending = true;
    this.betaService.sendFeedback(this.feedbackCategory, message, this.router.url).subscribe({
      next: response => {
        this.feedbackSending = false;
        this.feedbackVisible = false;
        this.feedbackMessage = '';
        this.messageService.add({ severity: 'success', summary: 'Obrigado!', detail: response.message });
      },
      error: error => {
        this.feedbackSending = false;
        this.messageService.add({ severity: 'error', summary: 'Feedback', detail: error.error?.error || 'Nao foi possivel enviar agora.' });
      },
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

  private async checkForAppUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) return;
    try {
      await this.swUpdate.checkForUpdate();
    } catch {
      // A falta temporária de rede não deve impedir o uso da aplicação.
    }
  }
}
