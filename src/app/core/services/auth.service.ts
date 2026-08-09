import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { User, LoginPayload, RegisterClientPayload, RegisterProviderPayload, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('lar_user');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('lar_token');
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
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
    if (!this.token || !this.currentUserValue) {
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.role === 'CLIENT' ? user.clientProfile : user.providerProfile
      } as User)),
      tap(user => {
        localStorage.setItem('lar_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('lar_token');
    localStorage.removeItem('lar_user');
    this.currentUserSubject.next(null);
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('lar_token', token);
    localStorage.setItem('lar_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
