import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public translate: TranslateService) {}
  
  @Input() currentUser: User | null = null;
  @Input() authPage: 'login' | 'register' | 'complete-google' | null = null;
  @Output() logoutClicked = new EventEmitter<void>();
  
  accountMenuOpen = false;
  langMenuOpen = false;

  get isClient(): boolean { return this.currentUser?.role === 'CLIENT'; }
  get isProvider(): boolean { return this.currentUser?.role === 'PROVIDER'; }
  get isAdmin(): boolean { return this.currentUser?.role === 'ADMIN'; }
  get isAnonymous(): boolean { return !this.authPage && !this.currentUser; }
  get isAuthenticated(): boolean { return !this.authPage && Boolean(this.currentUser); }
  get showLoginAction(): boolean { return this.authPage === 'login'; }
  get showRegisterAction(): boolean { return this.authPage === 'register'; }
  get accountDisplayName(): string { return this.currentUser?.profile?.fullName || this.currentUser?.email || ''; }
  get accountEmail(): string { return this.currentUser?.email || ''; }

  get avatarUrl(): string | null {
    const profile = this.currentUser?.profile;
    const professionalPhoto = profile && 'photoUrl' in profile ? profile.photoUrl : null;
    return this.currentUser?.avatarUrl || professionalPhoto || null;
  }

  get profileLink(): string {
    return this.currentUser?.role === 'PROVIDER' ? '/provider/profile' : '/client';
  }

  get roleLabel(): string {
    const labels: Record<string, string> = { CLIENT: 'Cliente', PROVIDER: 'Professional', ADMIN: 'Administrador' };
    return labels[this.currentUser?.role || ''] || '';
  }

  toggleAccountMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
    this.langMenuOpen = false;
  }

  toggleLangMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
    this.accountMenuOpen = false;
  }

  closeMenus(): void {
    this.accountMenuOpen = false;
    this.langMenuOpen = false;
  }

  logout(): void {
    this.closeMenus();
    this.logoutClicked.emit();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenus();
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.closeMenus();
  }
}
