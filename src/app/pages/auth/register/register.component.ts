import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerRole: 'CLIENT' | 'PROVIDER' = 'CLIENT';
  
  fullName = '';
  email = '';
  password = '';
  phone = '';
  neighborhood = '';
  city = '';
  
  // Client only
  fullAddress = '';
  
  // Provider only
  bio = '';
  serviceRadiusKm = 10;
  categories: Category[] = [];
  selectedCategoryIds: string[] = [];

  error = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
      this.selectedCategoryIds = cats.map(c => c.id);
    });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = this.normalizePhone(input.value).slice(0, 11);
    let formatted = digits;

    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    this.phone = formatted;
    input.value = formatted;
  }

  onRegister() {
    const normalizedPhone = this.normalizePhone(this.phone);
    if (!this.isValidMobilePhone(normalizedPhone)) {
      this.error = 'Informe um celular válido com DDD e 11 dígitos. Ex.: (27) 99999-9999.';
      this.messageService.add({ severity: 'error', summary: 'Celular inválido', detail: this.error });
      return;
    }

    this.error = '';
    this.isLoading = true;
    if (this.registerRole === 'CLIENT') {
      this.authService.registerClient({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        phone: normalizedPhone,
        neighborhood: this.neighborhood,
        city: this.city,
        fullAddress: this.fullAddress || `${this.neighborhood}, ${this.city}`
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cadastro realizado com sucesso!' });
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.error || 'Erro ao cadastrar cliente.';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
        }
      });
    } else {
      this.authService.registerProvider({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        phone: normalizedPhone,
        bio: this.bio,
        city: this.city,
        neighborhood: this.neighborhood,
        serviceRadiusKm: this.serviceRadiusKm,
        categoryIds: this.selectedCategoryIds
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cadastro de profissional realizado!' });
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.error || 'Erro ao cadastrar profissional.';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
        }
      });
    }
  }

  private normalizePhone(value: string): string {
    return value.replace(/\D/g, '');
  }

  private isValidMobilePhone(phone: string): boolean {
    return /^[1-9]{2}9\d{8}$/.test(phone);
  }
}
