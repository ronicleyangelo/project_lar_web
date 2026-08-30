import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

const MOBILE_PHONE_PATTERN = /^[1-9]{2}9\d{8}$/;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  readonly form = this.formBuilder.nonNullable.group({
    role: ['CLIENT' as 'CLIENT' | 'PROVIDER', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [Validators.required, Validators.pattern(MOBILE_PHONE_PATTERN)]],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    fullAddress: ['', Validators.required],
    bio: [''],
    serviceRadiusKm: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    propertyTypes: [['HOUSE', 'APARTMENT'] as string[], Validators.required],
    acceptsPets: [true],
  });

  readonly propertyTypeOptions = [
    { value: 'HOUSE', label: 'Casa' },
    { value: 'APARTMENT', label: 'Apartamento' },
    { value: 'CONDOMINIUM', label: 'Condomínio' },
  ];
  error = '';
  isLoading = false;

  get registerRole(): 'CLIENT' | 'PROVIDER' {
    return this.form.controls.role.value;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form.controls.role.valueChanges.subscribe(role => this.updateConditionalValidators(role));
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    const formatted = digits.length > 7
      ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
      : digits.length > 2 ? `(${digits.slice(0, 2)}) ${digits.slice(2)}` : digits;
    this.form.controls.phone.setValue(digits);
    this.form.controls.phone.markAsTouched();
    input.value = formatted;
  }

  onRegister(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showError('Revise os campos destacados antes de continuar.');
      return;
    }

    const value = this.form.getRawValue();
    this.error = '';
    this.isLoading = true;
    const request$ = value.role === 'CLIENT'
      ? this.authService.registerClient({
          fullName: value.fullName.trim(), email: value.email.trim(), password: value.password,
          phone: value.phone, neighborhood: value.neighborhood.trim(), city: value.city.trim(),
          fullAddress: value.fullAddress.trim(),
        })
      : this.authService.registerProvider({
          fullName: value.fullName.trim(), email: value.email.trim(), password: value.password,
          phone: value.phone, bio: value.bio.trim(), city: value.city.trim(),
          neighborhood: value.neighborhood.trim(), serviceRadiusKm: value.serviceRadiusKm,
          propertyTypes: value.propertyTypes,
          acceptsPets: value.acceptsPets,
        });

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cadastro realizado com sucesso!' });
        this.router.navigate(['/']);
      },
      error: err => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Erro ao realizar o cadastro.');
      },
    });
  }

  private updateConditionalValidators(role: 'CLIENT' | 'PROVIDER'): void {
    const fullAddress = this.form.controls.fullAddress;
    const propertyTypes = this.form.controls.propertyTypes;
    role === 'CLIENT' ? fullAddress.setValidators(Validators.required) : fullAddress.clearValidators();
    if (role === 'PROVIDER') {
      propertyTypes.setValidators(Validators.required);
    } else {
      propertyTypes.clearValidators();
    }
    fullAddress.updateValueAndValidity();
    propertyTypes.updateValueAndValidity();
  }

  toggleList(controlName: 'propertyTypes', value: string, checked: boolean): void {
    const control = this.form.controls[controlName];
    control.setValue(checked
      ? Array.from(new Set([...control.value, value]))
      : control.value.filter(item => item !== value));
    control.markAsTouched();
  }

  private showError(message: string): void {
    this.error = message;
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }
}
