import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleProfile } from '../../../core/models/user.model';
import { LegalDialogService } from '../../../core/services/legal-dialog.service';

const MOBILE_PHONE_PATTERN = /^[1-9]{2}9\d{8}$/;

@Component({
  selector: 'app-complete-google-registration',
  templateUrl: './complete-google-registration.component.html',
  styleUrls: ['./complete-google-registration.component.css'],
})
export class CompleteGoogleRegistrationComponent implements OnInit {
  readonly form = this.formBuilder.nonNullable.group({
    role: ['CLIENT' as 'CLIENT' | 'PROVIDER', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(MOBILE_PHONE_PATTERN)]],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    fullAddress: ['', Validators.required],
    bio: [''],
    serviceRadiusKm: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    propertyTypes: [['HOUSE', 'APARTMENT'] as string[], Validators.required],
    acceptsPets: [true],
    acceptPrivacy: [false, Validators.requiredTrue],
    acceptTerms: [false, Validators.requiredTrue],
  });

  profile?: GoogleProfile;
  onboardingToken = '';
  readonly propertyTypeOptions = [
    { value: 'HOUSE', label: 'Casa' },
    { value: 'APARTMENT', label: 'Apartamento' },
    { value: 'CONDOMINIUM', label: 'Condomínio' },
  ];
  error = '';
  isLoading = false;

  get role(): 'CLIENT' | 'PROVIDER' {
    return this.form.controls.role.value;
  }
  get isClientRegistration(): boolean { return this.role === 'CLIENT'; }
  get isProviderRegistration(): boolean { return this.role === 'PROVIDER'; }

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    public legalDialogs: LegalDialogService,
  ) {}

  ngOnInit(): void {
    try {
      const stored = JSON.parse(sessionStorage.getItem('lar_google_onboarding') || 'null');
      if (!stored?.token || !stored?.profile) throw new Error();
      this.onboardingToken = stored.token;
      this.profile = stored.profile;
      this.form.controls.fullName.setValue(stored.profile.fullName);
      const draft = JSON.parse(sessionStorage.getItem('lar_google_onboarding_draft') || 'null');
      if (draft?.email === stored.profile.email && draft?.form) {
        this.form.patchValue(draft.form);
      }
    } catch {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.form.controls.role.valueChanges.subscribe(role => this.updateConditionalValidators(role));
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    const formatted = digits.length > 7
      ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
      : digits.length > 2 ? `(${digits.slice(0, 2)}) ${digits.slice(2)}` : digits;
    this.form.controls.phone.setValue(digits, { emitEvent: true });
    this.form.controls.phone.markAsTouched();
    this.form.controls.phone.updateValueAndValidity();
    input.value = formatted;
  }

  togglePropertyType(propertyType: string, checked: boolean): void {
    const control = this.form.controls.propertyTypes;
    control.setValue(checked
      ? Array.from(new Set([...control.value, propertyType]))
      : control.value.filter(value => value !== propertyType));
    control.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showError('Revise os campos destacados antes de continuar.');
      return;
    }

    const value = this.form.getRawValue();
    this.isLoading = true;
    this.error = '';
    this.authService.completeGoogleRegistration({
      onboardingToken: this.onboardingToken,
      role: value.role,
      phone: value.phone,
      fullName: value.fullName.trim(),
      neighborhood: value.neighborhood.trim(),
      city: value.city.trim(),
      fullAddress: value.role === 'CLIENT' ? value.fullAddress.trim() : undefined,
      bio: value.role === 'PROVIDER' ? value.bio.trim() : undefined,
      serviceRadiusKm: value.role === 'PROVIDER' ? value.serviceRadiusKm : undefined,
      propertyTypes: value.role === 'PROVIDER' ? value.propertyTypes : undefined,
      acceptsPets: value.role === 'PROVIDER' ? value.acceptsPets : undefined,
      acceptPrivacy: value.acceptPrivacy,
      acceptTerms: value.acceptTerms,
    }).subscribe({
      next: response => {
        sessionStorage.removeItem('lar_google_onboarding');
        sessionStorage.removeItem('lar_google_onboarding_draft');
        this.messageService.add({ severity: 'success', summary: 'Conta criada', detail: 'Seu cadastro foi concluído!' });
        this.router.navigate([response.user.role === 'PROVIDER' ? '/provider/profile' : '/explore']);
      },
      error: err => {
        this.isLoading = false;
        if (err.status === 401) {
          sessionStorage.setItem('lar_google_onboarding_draft', JSON.stringify({
            email: this.profile?.email,
            form: this.form.getRawValue(),
          }));
          this.showError('Sua sessão de cadastro expirou. Entre com o Google novamente; seus dados foram preservados.');
          this.router.navigate(['/auth/login']);
          return;
        }
        this.showError(err.error?.error || 'Não foi possível concluir o cadastro.');
      },
    });
  }

  private updateConditionalValidators(role: 'CLIENT' | 'PROVIDER'): void {
    const fullAddress = this.form.controls.fullAddress;
    const serviceRadius = this.form.controls.serviceRadiusKm;
    const propertyTypes = this.form.controls.propertyTypes;

    if (role === 'CLIENT') {
      fullAddress.setValidators(Validators.required);
      serviceRadius.clearValidators();
      propertyTypes.clearValidators();
    } else {
      fullAddress.clearValidators();
      serviceRadius.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
      propertyTypes.setValidators(Validators.required);
    }
    fullAddress.updateValueAndValidity();
    serviceRadius.updateValueAndValidity();
    propertyTypes.updateValueAndValidity();
  }

  private showError(message: string): void {
    this.error = message;
    this.messageService.add({ severity: 'error', summary: 'Revise os dados', detail: message });
  }
}
