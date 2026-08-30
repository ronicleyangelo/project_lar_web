import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      filter((user): user is User => Boolean(user)),
      take(1),
    ).subscribe(user => this.router.navigateByUrl(this.destinationFor(user.role), { replaceUrl: true }));
  }

  private destinationFor(role: User['role']): string {
    if (role === 'PROVIDER') return '/provider/opportunities';
    if (role === 'ADMIN') return '/admin';
    return '/explore';
  }
}
