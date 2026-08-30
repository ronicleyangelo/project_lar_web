import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { MessageService } from 'primeng/api';
import { VERIFICATION_STATUS_VIEWS } from '../../core/presentation/lifecycle-view';
import { AdminMetrics, AdminProvider } from '../../core/models/admin.model';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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
    { id: 'PHOTO', label: 'ADMIN.CORRECTION_PHOTO', icon: 'account_circle' },
    { id: 'CONTACT', label: 'ADMIN.CORRECTION_CONTACT', icon: 'contact_phone' },
    { id: 'LOCATION', label: 'ADMIN.CORRECTION_LOCATION', icon: 'location_on' },
    { id: 'RADIUS', label: 'ADMIN.CORRECTION_RADIUS', icon: 'distance' },
    { id: 'PRICE', label: 'ADMIN.CORRECTION_PRICE', icon: 'payments' },
    { id: 'BIO', label: 'ADMIN.CORRECTION_BIO', icon: 'description' },
    { id: 'PROPERTY', label: 'ADMIN.CORRECTION_PROPERTY', icon: 'home' },
    { id: 'ACTIVITIES', label: 'ADMIN.CORRECTION_ACTIVITIES', icon: 'checklist' },
  ];
  readonly selectedCorrectionIds = new Set<string>();

  get metricCards() {
    return [
      { label: this.translate.instant('ADMIN.METRIC_USERS'), value: this.adminMetrics.totalUsers, detail: this.translate.instant('ADMIN.METRIC_CLIENTS', { count: this.adminMetrics.totalClients }), icon: 'group', tone: 'primary' },
      { label: this.translate.instant('ADMIN.METRIC_PROFESSIONALS'), value: this.adminMetrics.totalProviders, detail: this.translate.instant('ADMIN.METRIC_AWAITING', { count: this.adminMetrics.pendingReviews }), icon: 'cleaning_services', tone: 'green' },
      { label: this.translate.instant('ADMIN.METRIC_OPEN_REQUESTS'), value: this.adminMetrics.openRequests, detail: this.translate.instant('ADMIN.METRIC_TOTAL_REQUESTS', { count: this.adminMetrics.totalRequests }), icon: 'assignment', tone: 'gold' },
      { label: this.translate.instant('ADMIN.METRIC_IN_PROGRESS'), value: this.adminMetrics.activeAppointments, detail: this.translate.instant('ADMIN.METRIC_COMPLETED', { count: this.adminMetrics.completedAppointments }), icon: 'event_available', tone: 'blue' },
      { label: this.translate.instant('ADMIN.METRIC_CONVERSION'), value: this.adminMetrics.conversionRate, detail: this.translate.instant('ADMIN.METRIC_CONVERSION_DESC'), icon: 'trending_up', tone: 'purple' },
      { label: this.translate.instant('ADMIN.METRIC_COMPLETION'), value: this.adminMetrics.completionRate, detail: this.translate.instant('ADMIN.METRIC_REVIEWS', { count: this.adminMetrics.totalReviews }), icon: 'task_alt', tone: 'teal' },
    ];
  }

  constructor(private adminService: AdminService, private messageService: MessageService, private translate: TranslateService) {}

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
      ? `${this.translate.instant('ADMIN.ITEMS_TO_CORRECT')}:\n${this.correctionOptions.filter(option => this.selectedCorrectionIds.has(option.id)).map(option => `- ${this.translate.instant(option.label)}`).join('\n')}${details ? `\n\n${this.translate.instant('ADMIN.TEAM_GUIDANCE')}:\n${details}` : ''}`
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
        this.messageService.add({ severity: 'success', summary: this.translate.instant('ADMIN.REVIEW_RECORDED'), detail: response.message });
        this.isSubmittingReview = false;
        this.closeReviewDialog();
      },
      error: error => {
        this.isSubmittingReview = false;
        this.messageService.add({ severity: 'error', summary: this.translate.instant('ADMIN.ERROR'), detail: error?.error?.error || this.translate.instant('ADMIN.REVIEW_ERROR') });
      },
    });
  }

  get reviewDialogTitle(): string { return this.translate.instant(this.reviewStatus === 'CHANGES_REQUESTED' ? 'ADMIN.REQUEST_CORRECTIONS' : 'ADMIN.REJECT_TITLE'); }
  get reviewDialogDescription(): string { return this.translate.instant(this.reviewStatus === 'CHANGES_REQUESTED' ? 'ADMIN.SELECT_FIELDS_DESCRIPTION' : 'ADMIN.REJECTION_DESCRIPTION'); }
  get canSubmitReview(): boolean { return this.reviewStatus === 'CHANGES_REQUESTED' ? this.selectedCorrectionIds.size > 0 && this.reviewNote.valid : this.reviewNote.valid; }

  providerLocation(provider: AdminProvider): string { const area = provider.coverageAreas[0]; return area ? `${area.neighborhood}, ${area.city}` : this.translate.instant('ADMIN.NOT_INFORMED'); }
  statusKey(status: string): string { return `ADMIN.STATUS_${status}`; }
  providerInitials(provider: AdminProvider): string { return provider.fullName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
  private showError(error: any): void { this.messageService.add({ severity: 'error', summary: this.translate.instant('ADMIN.DASHBOARD_ERROR'), detail: error?.error?.error || this.translate.instant('ADMIN.LOAD_ERROR') }); }
}
