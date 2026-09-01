import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { AccountSettings } from '../../core/models/account.model';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
})
export class AccountPageComponent implements OnInit {
  account?: AccountSettings;
  isLoading = true;
  isSavingPrivacy = false;
  isSavingPassword = false;
  isDeleting = false;
  isExporting = false;
  deletionDialogVisible = false;
  get isDeletionPending(): boolean { return this.account?.status === 'DELETION_PENDING'; }
  get canRequestDeletion(): boolean { return Boolean(this.account) && !this.isDeletionPending; }
  get emailStatusLabel(): string { return this.account?.emailVerified ? 'Verificado' : 'Não verificado'; }
  get googleConnectionLabel(): string { return this.account?.googleLinked ? 'Conta Google vinculada' : 'Não vinculado'; }
  get googleStatusLabel(): string { return this.account?.googleLinked ? 'Conectado' : 'Inativo'; }
  get passwordTitle(): string { return this.account?.hasPassword ? 'Alterar senha' : 'Criar uma senha'; }
  get passwordDescription(): string { return this.account?.hasPassword ? 'Atualize sua senha de acesso.' : 'Crie uma senha para também entrar sem o Google.'; }
  get passwordButtonLabel(): string { return this.isSavingPassword ? 'Salvando...' : (this.account?.hasPassword ? 'Alterar senha' : 'Criar senha'); }

  readonly privacyForm = this.formBuilder.nonNullable.group({
    profileVisible: [true],
    allowRecommendations: [true],
  });
  readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: [''],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });
  readonly deleteForm = this.formBuilder.nonNullable.group({
    confirmation: ['', Validators.required],
    currentPassword: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.accountService.get().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: account => {
        this.account = account;
        this.privacyForm.setValue({
          profileVisible: account.profileVisible,
          allowRecommendations: account.allowRecommendations,
        });
        this.privacyForm.markAsPristine();
        if (account.hasPassword) {
          this.passwordForm.controls.currentPassword.addValidators(Validators.required);
          this.passwordForm.controls.currentPassword.updateValueAndValidity();
          this.deleteForm.controls.currentPassword.addValidators(Validators.required);
          this.deleteForm.controls.currentPassword.updateValueAndValidity();
        }
      },
      error: error => this.showError(error, 'Não foi possível carregar sua conta.'),
    });
  }

  savePrivacy(): void {
    const value = this.privacyForm.getRawValue();
    this.isSavingPrivacy = true;
    this.accountService.updatePrivacy(value.profileVisible, value.allowRecommendations)
      .pipe(finalize(() => this.isSavingPrivacy = false)).subscribe({
        next: () => {
          this.privacyForm.markAsPristine();
          this.messageService.add({ severity: 'success', summary: 'Privacidade atualizada', detail: 'Suas preferências foram salvas.' });
        },
        error: error => this.showError(error, 'Não foi possível salvar suas preferências.'),
      });
  }

  savePassword(): void {
    const value = this.passwordForm.getRawValue();
    if (this.passwordForm.invalid || value.newPassword !== value.confirmPassword) {
      this.passwordForm.markAllAsTouched();
      if (value.newPassword !== value.confirmPassword) this.showError(null, 'A confirmação não corresponde à nova senha.');
      return;
    }
    this.isSavingPassword = true;
    this.accountService.updatePassword(value.currentPassword, value.newPassword)
      .pipe(finalize(() => this.isSavingPassword = false)).subscribe({
        next: response => {
          if (this.account) this.account.hasPassword = true;
          this.passwordForm.reset();
          this.messageService.add({ severity: 'success', summary: 'Segurança atualizada', detail: response.message });
        },
        error: error => this.showError(error, 'Não foi possível atualizar a senha.'),
      });
  }

  requestAccountDeletion(): void {
    if (this.deleteForm.invalid || this.deleteForm.controls.confirmation.value !== 'EXCLUIR MINHA CONTA') {
      this.deleteForm.markAllAsTouched();
      this.showError(null, 'Digite EXCLUIR MINHA CONTA para confirmar.');
      return;
    }
    this.isDeleting = true;
    const value = this.deleteForm.getRawValue();
    this.accountService.requestDeletion(value.confirmation, value.currentPassword)
      .pipe(finalize(() => this.isDeleting = false)).subscribe({
        next: response => {
          this.deletionDialogVisible = false;
          this.authService.logout().subscribe(() => this.router.navigate(['/auth/login']));
          this.messageService.add({ severity: 'success', summary: 'Exclusão agendada', detail: response.message });
        },
        error: error => this.showError(error, 'Não foi possível agendar a exclusão da conta.'),
      });
  }

  cancelAccountDeletion(): void {
    this.isDeleting = true;
    this.accountService.cancelDeletion().pipe(finalize(() => this.isDeleting = false)).subscribe({
      next: response => {
        if (this.account) {
          this.account.status = 'ACTIVE';
          this.account.deletionRequestedAt = null;
          this.account.scheduledDeletionAt = null;
        }
        this.authService.restoreSession().subscribe();
        this.messageService.add({ severity: 'success', summary: 'Exclusão cancelada', detail: response.message });
      },
      error: error => this.showError(error, 'Não foi possível cancelar a exclusão.'),
    });
  }

  exportData(): void {
    this.isExporting = true;
    this.accountService.exportData().pipe(finalize(() => this.isExporting = false)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'projeto-lar-meus-dados.json';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: error => this.showError(error, 'Não foi possível exportar seus dados.'),
    });
  }

  private showError(error: any, fallback: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.error || fallback });
  }
}
