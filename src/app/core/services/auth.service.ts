import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { User, LoginPayload, RegisterClientPayload, RegisterProviderPayload, AuthResponse, GoogleAuthResponse, CompleteGoogleRegistrationPayload } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private sessionVersion = 0;
  private restoreSessionRequest?: Observable<User | null>;

  constructor(private http: HttpClient) {
    // A sessão é controlada pelo cookie HttpOnly, não pelo cache do navegador.
    localStorage.removeItem('lar_user');
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    // Fallback para navegadores que bloqueiam o cookie entre o frontend e a API.
    // A identidade do usuário continua sendo buscada em /auth/me após o F5.
    return localStorage.getItem('lar_token');
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  loginWithGoogle(credential: string): Observable<GoogleAuthResponse> {
    return this.http.post<GoogleAuthResponse>(`${this.apiUrl}/google`, { credential }, {
      headers: { 'X-Silent-Request': 'true' },
    }).pipe(
      tap(res => {
        if (res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  completeGoogleRegistration(payload: CompleteGoogleRegistrationPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google/complete`, payload, {
      headers: { 'X-Silent-Request': 'true' },
    }).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  registerClient(payload: RegisterClientPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register-client`, payload).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  registerProvider(payload: RegisterProviderPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register-provider`, payload).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  /** Confirma que o token ainda representa uma conta existente no servidor. */
  restoreSession(): Observable<User | null> {
    if (this.currentUserValue) return of(this.currentUserValue);
    // Sem token não existe sessão para restaurar. Evita um /auth/me 401 normal
    // ao abrir ou atualizar a aplicação depois de sair da conta.
    if (!this.token) return of(null);
    if (this.restoreSessionRequest) return this.restoreSessionRequest;

    const requestSessionVersion = this.sessionVersion;
    this.restoreSessionRequest = this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        profile: user.role === 'CLIENT' ? user.clientProfile : user.providerProfile
      } as User)),
      tap(user => {
        if (requestSessionVersion === this.sessionVersion) {
          this.currentUserSubject.next(user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (requestSessionVersion === this.sessionVersion && (error.status === 401 || error.status === 403)) {
          this.clearLocalSession();
        }
        return of(null);
      }),
      finalize(() => this.restoreSessionRequest = undefined),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.restoreSessionRequest;
  }

  logout(): Observable<void> {
    this.clearLocalSession();

    // A exclusão local não basta: o cookie HttpOnly só pode ser removido pelo
    // servidor. O caller aguarda esta requisição antes de navegar/recarregar.
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(void 0))
    );
  }

  private clearLocalSession(): void {
    this.sessionVersion++;
    localStorage.removeItem('lar_token');
    localStorage.removeItem('lar_user');
    sessionStorage.removeItem('lar_google_onboarding');
    sessionStorage.removeItem('lar_google_onboarding_draft');
    this.currentUserSubject.next(null);
  }

  private setSession(token: string, user: User): void {
    this.sessionVersion++;
    localStorage.setItem('lar_token', token);
    this.currentUserSubject.next(user);
  }
}
