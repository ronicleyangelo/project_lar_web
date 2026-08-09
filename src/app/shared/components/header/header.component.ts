import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() currentUser: User | null = null;
  @Input() authPage: 'login' | 'register' | null = null;
  @Output() logoutClicked = new EventEmitter<void>();
}
