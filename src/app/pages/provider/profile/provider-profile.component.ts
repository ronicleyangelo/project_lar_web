import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ProviderProfileService } from '../../../core/services/provider-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { EditableProviderProfile } from '../../../core/models/provider-profile.model';
import { ActivityService } from '../../../core/services/activity.service';
import { ServiceActivity } from '../../../core/models/service-activity.model';
import { TranslateService } from '@ngx-translate/core';

const MOBILE_PHONE_PATTERN = /^[1-9]{2}9\d{8}$/;
type VerificationStatus = EditableProviderProfile['verificationStatus'];
interface VerificationView { label: string; help: string; icon: string; verified: boolean; canSubmit: boolean; }

const VERIFICATION_VIEWS: Record<VerificationStatus, VerificationView> = {
  DRAFT: { label: 'Perfil em preparação', help: 'Complete e salve o perfil; depois envie para a análise da equipe.', icon: 'edit_note', verified: false, canSubmit: true },
  PENDING_REVIEW: { label: 'Aguardando análise', help: 'Sua análise está na fila. Enquanto isso, você pode editar seus dados.', icon: 'schedule', verified: false, canSubmit: false },
  CHANGES_REQUESTED: { label: 'Correções solicitadas', help: 'Revise a mensagem da equipe, ajuste o perfil e envie novamente.', icon: 'rate_review', verified: false, canSubmit: true },
  VERIFIED: { label: 'Perfil verificado', help: 'Seu perfil está aprovado e disponível para receber pedidos.', icon: 'verified', verified: true, canSubmit: false },
  REJECTED: { label: 'Perfil não aprovado', help: 'Consulte a mensagem da equipe antes de realizar um novo envio.', icon: 'block', verified: false, canSubmit: true },
};

@Component({
  selector: 'app-provider-profile',
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.css'],
})
export class ProviderProfileComponent implements OnInit {
  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(MOBILE_PHONE_PATTERN)]],
    bio: [''],
    photoUrl: [''],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    serviceRadiusKm: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    propertyTypes: [[] as string[], Validators.required],
    acceptsPets: [true],
    basePrice: [25, [Validators.required, Validators.min(25)]],
    activityIds: [[] as string[], Validators.required],
  });
  readonly propertyTypeOptions = [
    { value: 'HOUSE', label: 'Casa' },
    { value: 'APARTMENT', label: 'Apartamento' },
    { value: 'CONDOMINIUM', label: 'Condomínio' },
  ];

  profile?: EditableProviderProfile;
  activities: ServiceActivity[] = [];
  isLoading = true;
  isSaving = false;
  isSubmittingReview = false;

  verificationView = VERIFICATION_VIEWS.DRAFT;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProviderProfileService,
    private activityService: ActivityService,
    private authService: AuthService,
    private messageService: MessageService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activityService.list().subscribe({
      next: activities => this.activities = activities,
      error: error => this.showError(error, 'Não foi possível carregar as atividades.'),
    });
    this.profileService.get().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: profile => {
        this.profile = profile;
        this.updateVerificationView(profile.verificationStatus);
        this.form.patchValue({
          fullName: profile.fullName,
          phone: profile.phone,
          bio: profile.bio,
          photoUrl: profile.photoUrl || '',
          neighborhood: profile.neighborhood,
          city: profile.city,
          serviceRadiusKm: profile.serviceRadiusKm,
          propertyTypes: profile.propertyTypes,
          acceptsPets: profile.acceptsPets,
          basePrice: profile.basePrice,
          activityIds: profile.activityIds,
        });
      },
      error: error => this.showError(error, 'Não foi possível carregar seu perfil.'),
    });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    const formatted = digits.length > 7
      ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
      : digits.length > 2 ? `(${digits.slice(0, 2)}) ${digits.slice(2)}` : digits;
    this.form.controls.phone.setValue(digits);
    input.value = formatted;
  }

  togglePropertyType(value: string, checked: boolean): void {
    const control = this.form.controls.propertyTypes;
    control.setValue(checked
      ? Array.from(new Set([...control.value, value]))
      : control.value.filter(item => item !== value));
    control.markAsTouched();
  }

  toggleActivity(id: string, checked: boolean): void {
    const control = this.form.controls.activityIds;
    control.setValue(checked ? Array.from(new Set([...control.value, id])) : control.value.filter(item => item !== id));
    control.markAsTouched();
  }

  save(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      if (!this.isSaving) this.showError(null, 'Revise os campos destacados antes de salvar.');
      return;
    }
    const value = this.form.getRawValue();
    this.isSaving = true;
    this.profileService.update({
      ...value,
      fullName: value.fullName.trim(),
      bio: value.bio.trim(),
      photoUrl: value.photoUrl.trim() || null,
      neighborhood: value.neighborhood.trim(),
      city: value.city.trim(),
    }).pipe(finalize(() => this.isSaving = false)).subscribe({
      next: profile => {
        this.profile = profile;
        this.updateVerificationView(profile.verificationStatus);
        this.form.markAsPristine();
        this.authService.restoreSession().subscribe();
        this.messageService.add({ severity: 'success', summary: 'Perfil atualizado', detail: 'Suas informações foram salvas.' });
      },
      error: error => this.showError(error, 'Não foi possível atualizar seu perfil.'),
    });
  }

  submitForReview(): void {
    if (this.form.dirty) {
      this.showError(null, 'Salve suas alterações antes de enviar o perfil para análise.');
      return;
    }
    this.isSubmittingReview = true;
    this.profileService.submitForReview().pipe(finalize(() => this.isSubmittingReview = false)).subscribe({
      next: response => {
        if (this.profile) { this.profile.verificationStatus = 'PENDING_REVIEW'; this.profile.verificationNote = null; }
        this.updateVerificationView('PENDING_REVIEW');
        this.messageService.add({ severity: 'success', summary: 'Perfil enviado', detail: response.message });
      },
      error: error => this.showError(error, 'Não foi possível enviar seu perfil para análise.'),
    });
  }

  private showError(error: any, fallback: string): void {
    const apiMessage = error?.error?.error;
    const technicalDetail = error?.error?.details;
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: technicalDetail ? `${apiMessage || fallback}: ${technicalDetail}` : (apiMessage || fallback) });
  }

  private updateVerificationView(status: VerificationStatus): void {
    this.verificationView = VERIFICATION_VIEWS[status];
  }
}
