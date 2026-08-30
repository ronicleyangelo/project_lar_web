import { Component, Input } from '@angular/core';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.css']
})
export class MobileNavComponent {
  @Input() currentUser: User | null = null;
  get isClient(): boolean { return this.currentUser?.role === 'CLIENT'; }
  get isProvider(): boolean { return this.currentUser?.role === 'PROVIDER'; }
  get isAdmin(): boolean { return this.currentUser?.role === 'ADMIN'; }
  get isAnonymous(): boolean { return !this.currentUser; }
}
