import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private messageService: MessageService
  ) {}

  onLogin() {
    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Bem-vindo', detail: 'Login realizado com sucesso!' });
        this.router.navigate(['/']);
      },
      error: err => {
        this.isLoading = false;
        this.error = err.error?.error || 'Login falhou. Verifique suas credenciais.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
      }
    });
  }
}