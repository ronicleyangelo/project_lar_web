import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';
import { FormBuilder, Validators } from '@angular/forms';

declare global {
  interface Window { google?: any; }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  error = '';
  isLoading = false;
  googleUnavailable = false;
  private googleScript?: HTMLScriptElement;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.loadGoogleButton();
  }

  ngOnDestroy(): void {
    window.google?.accounts?.id?.cancel();
  }

  onLogin() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.authService.login(this.form.getRawValue()).subscribe({
      next: response => {
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Bem-vindo', detail: 'Login realizado com sucesso!' });
        this.router.navigate([response.user.status === 'DELETION_PENDING' ? '/account' : this.destinationFor(response.user.role)]);
      },
      error: err => {
        this.isLoading = false;
        this.error = err.error?.error || 'Login falhou. Verifique suas credenciais.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
      }
    });
  }

  private loadGoogleButton(): void {
    if (!environment.googleClientId || environment.googleClientId.startsWith('SEU_')) {
      this.googleUnavailable = true;
      return;
    }

    const render = () => {
      const target = document.getElementById('google-signin-button');
      if (!target || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential?: string }) => {
          this.ngZone.run(() => this.handleGoogleCredential(response.credential));
        },
      });
      window.google.accounts.id.renderButton(target, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
        shape: 'rectangular', logo_alignment: 'left', width: 348, locale: 'pt_BR',
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', render, { once: true });
      return;
    }

    this.googleScript = document.createElement('script');
    this.googleScript.src = 'https://accounts.google.com/gsi/client?hl=pt_BR';
    this.googleScript.async = true;
    this.googleScript.defer = true;
    this.googleScript.dataset['googleIdentity'] = 'true';
    this.googleScript.onload = render;
    this.googleScript.onerror = () => this.ngZone.run(() => { this.googleUnavailable = true; });
    document.head.appendChild(this.googleScript);
  }

  private handleGoogleCredential(credential?: string): void {
    if (!credential) {
      this.showGoogleError('O Google não retornou uma credencial válida.');
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.authService.loginWithGoogle(credential).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.requiresOnboarding && response.onboardingToken && response.googleProfile) {
          sessionStorage.setItem('lar_google_onboarding', JSON.stringify({
            token: response.onboardingToken,
            profile: response.googleProfile,
          }));
          this.router.navigate(['/auth/complete-google']);
          return;
        }
        this.messageService.add({ severity: 'success', summary: 'Bem-vindo', detail: 'Login com Google realizado!' });
        this.router.navigate([response.user?.status === 'DELETION_PENDING' ? '/account' : this.destinationFor(response.user?.role)]);
      },
      error: err => {
        this.isLoading = false;
        this.showGoogleError(err.error?.error || 'Não foi possível entrar com o Google.');
      },
    });
  }

  private showGoogleError(message: string): void {
    this.error = message;
    this.messageService.add({ severity: 'error', summary: 'Erro no Google', detail: message });
  }

  private destinationFor(role?: string): string {
    if (role === 'PROVIDER') return '/provider/opportunities';
    if (role === 'ADMIN') return '/admin';
    return '/explore';
  }
}
