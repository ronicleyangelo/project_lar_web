import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { MessageService } from 'primeng/api';
import { VERIFICATION_STATUS_VIEWS } from '../../core/presentation/lifecycle-view';
import { AdminMetrics, AdminProvider } from '../../core/models/admin.model';
import { FormControl, Validators } from '@angular/forms';

type ReviewDecision = 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  readonly verificationStatusViews = VERIFICATION_STATUS_VIEWS;
  adminMetrics: AdminMetrics = { totalUsers: 0, totalClients: 0, totalProviders: 0, totalRequests: 0, openRequests: 0, totalQuotes: 0, totalAppointments: 0, activeAppointments: 0, completedAppointments: 0, totalReviews: 0, pendingReviews: 0, suspendedUsers: 0, conversionRate: '0%', completionRate: '0%' };
  adminProviders: AdminProvider[] = [];
  isLoading = true;
  reviewDialogVisible = false;
  isSubmittingReview = false;
  selectedProvider: AdminProvider | null = null;
  reviewStatus: Exclude<ReviewDecision, 'VERIFIED'> = 'CHANGES_REQUESTED';
  readonly reviewNote = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)] });
  readonly correctionOptions = [
    { id: 'PHOTO', label: 'Foto do perfil', icon: 'account_circle' },
    { id: 'CONTACT', label: 'Nome ou telefone', icon: 'contact_phone' },
    { id: 'LOCATION', label: 'Cidade ou bairro', icon: 'location_on' },
    { id: 'RADIUS', label: 'Raio de atendimento', icon: 'distance' },
    { id: 'PRICE', label: 'Valor por hora', icon: 'payments' },
    { id: 'BIO', label: 'Bio e qualificações', icon: 'description' },
    { id: 'PROPERTY', label: 'Imóveis e pets', icon: 'home' },
    { id: 'ACTIVITIES', label: 'Atividades oferecidas', icon: 'checklist' },
  ];
  readonly selectedCorrectionIds = new Set<string>();

  get metricCards() {
    return [
      { label: 'Usuários', value: this.adminMetrics.totalUsers, detail: `${this.adminMetrics.totalClients} clientes`, icon: 'group', tone: 'primary' },
      { label: 'Profissionais', value: this.adminMetrics.totalProviders, detail: `${this.adminMetrics.pendingReviews} aguardando análise`, icon: 'cleaning_services', tone: 'green' },
      { label: 'Pedidos abertos', value: this.adminMetrics.openRequests, detail: `${this.adminMetrics.totalRequests} pedidos no total`, icon: 'assignment', tone: 'gold' },
      { label: 'Em andamento', value: this.adminMetrics.activeAppointments, detail: `${this.adminMetrics.completedAppointments} concluídos`, icon: 'event_available', tone: 'blue' },
      { label: 'Conversão', value: this.adminMetrics.conversionRate, detail: 'Pedidos que viraram agenda', icon: 'trending_up', tone: 'purple' },
      { label: 'Conclusão', value: this.adminMetrics.completionRate, detail: `${this.adminMetrics.totalReviews} avaliações`, icon: 'task_alt', tone: 'teal' },
    ];
  }

  constructor(private adminService: AdminService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadAdminDashboard();
  }

  loadAdminDashboard() {
    this.adminService.getMetrics().subscribe({ next: metrics => this.adminMetrics = metrics, error: error => this.showError(error) });
    this.adminService.getProviders().subscribe({ next: providers => { this.adminProviders = providers; this.isLoading = false; }, error: error => { this.isLoading = false; this.showError(error); } });
  }

  openReviewDialog(provider: AdminProvider, status: Exclude<ReviewDecision, 'VERIFIED'>): void {
    this.selectedProvider = provider;
    this.reviewStatus = status;
    this.reviewNote.reset('');
    this.selectedCorrectionIds.clear();
    this.reviewNote.setValidators(status === 'REJECTED' ? [Validators.required, Validators.minLength(10), Validators.maxLength(500)] : [Validators.maxLength(500)]);
    this.reviewNote.updateValueAndValidity();
    this.reviewDialogVisible = true;
  }

  closeReviewDialog(): void {
    if (this.isSubmittingReview) return;
    this.reviewDialogVisible = false;
    this.selectedProvider = null;
    this.reviewNote.reset('');
    this.selectedCorrectionIds.clear();
  }

  toggleCorrection(id: string): void { this.selectedCorrectionIds.has(id) ? this.selectedCorrectionIds.delete(id) : this.selectedCorrectionIds.add(id); }
  isCorrectionSelected(id: string): boolean { return this.selectedCorrectionIds.has(id); }

  submitReviewNote(): void {
    this.reviewNote.markAsTouched();
    if (!this.selectedProvider || !this.canSubmitReview) return;
    const details = this.reviewNote.value.trim();
    const note = this.reviewStatus === 'CHANGES_REQUESTED'
      ? `Itens para corrigir:\n${this.correctionOptions.filter(option => this.selectedCorrectionIds.has(option.id)).map(option => `- ${option.label}`).join('\n')}${details ? `\n\nOrientação da equipe:\n${details}` : ''}`
      : details;
    this.reviewProvider(this.selectedProvider, this.reviewStatus, note);
  }

  reviewProvider(provider: AdminProvider, status: ReviewDecision, note = ''): void {
    this.isSubmittingReview = true;
    this.adminService.reviewProvider(provider.id, status, note).subscribe({
      next: response => {
        const wasPending = provider.verificationStatus === 'PENDING_REVIEW';
        provider.verificationStatus = status;
        provider.verificationNote = note || null;
        if (wasPending) this.adminMetrics.pendingReviews = Math.max(0, this.adminMetrics.pendingReviews - 1);
        this.messageService.add({ severity: 'success', summary: 'Análise registrada', detail: response.message });
        this.isSubmittingReview = false;
        this.closeReviewDialog();
      },
      error: error => {
        this.isSubmittingReview = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.error || 'Não foi possível registrar a análise.' });
      },
    });
  }

  get reviewDialogTitle(): string { return this.reviewStatus === 'CHANGES_REQUESTED' ? 'Solicitar correções' : 'Reprovar profissional'; }
  get reviewDialogDescription(): string { return this.reviewStatus === 'CHANGES_REQUESTED' ? 'Marque exatamente quais dados precisam ser atualizados. Você também pode acrescentar uma orientação.' : 'Informe o motivo da reprovação para que a decisão fique registrada.'; }
  get canSubmitReview(): boolean { return this.reviewStatus === 'CHANGES_REQUESTED' ? this.selectedCorrectionIds.size > 0 && this.reviewNote.valid : this.reviewNote.valid; }

  providerLocation(provider: AdminProvider): string { const area = provider.coverageAreas[0]; return area ? `${area.neighborhood}, ${area.city}` : 'Não informada'; }
  providerInitials(provider: AdminProvider): string { return provider.fullName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
  private showError(error: any): void { this.messageService.add({ severity: 'error', summary: 'Erro no painel', detail: error?.error?.error || 'Não foi possível carregar os dados administrativos.' }); }
}
