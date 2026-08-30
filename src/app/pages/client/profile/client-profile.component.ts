import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { ClientProfileService, EditableClientProfile } from '../../../core/services/client-profile.service';

@Component({ selector: 'app-client-profile', templateUrl: './client-profile.component.html', styleUrls: ['./client-profile.component.css'] })
export class ClientProfileComponent implements OnInit {
  profile: EditableClientProfile | null = null;
  isLoading = true;
  isSaving = false;
  readonly form = this.fb.nonNullable.group({ fullName: ['', [Validators.required, Validators.minLength(3)]], phone: ['', [Validators.required, Validators.pattern(/^[1-9]{2}9\d{8}$/)]], city: ['', Validators.required], neighborhood: ['', Validators.required], fullAddress: ['', Validators.required] });
  constructor(private readonly fb: FormBuilder, private readonly profiles: ClientProfileService, private readonly messages: MessageService) {}
  ngOnInit(): void { this.profiles.get().pipe(finalize(() => this.isLoading = false)).subscribe({ next: profile => { this.profile = profile; this.form.patchValue(profile); }, error: error => this.showError(error) }); }
  save(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.isSaving) return; this.isSaving = true; this.profiles.update(this.form.getRawValue()).pipe(finalize(() => this.isSaving = false)).subscribe({ next: response => { this.profile = { ...this.profile!, ...response.profile }; this.form.markAsPristine(); this.messages.add({ severity: 'success', summary: 'Perfil atualizado', detail: response.message }); }, error: error => this.showError(error) }); }
  private showError(error: any): void { this.messages.add({ severity: 'error', summary: 'Erro', detail: error?.error?.error || 'Não foi possível atualizar seu perfil.' }); }
}
