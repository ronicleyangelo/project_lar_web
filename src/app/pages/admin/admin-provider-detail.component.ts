import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AdminProvider } from '../../core/models/admin.model';
import { AdminService } from '../../core/services/admin.service';
import { VERIFICATION_STATUS_VIEWS } from '../../core/presentation/lifecycle-view';
import { TranslateService } from '@ngx-translate/core';

type ReviewStatus = 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED';

@Component({ selector: 'app-admin-provider-detail', templateUrl: './admin-provider-detail.component.html', styleUrls: ['./admin-provider-detail.component.css'] })
export class AdminProviderDetailComponent implements OnInit {
  readonly verificationStatusViews = VERIFICATION_STATUS_VIEWS;
  readonly correctionOptions = [
    ['PHOTO', 'ADMIN.CORRECTION_PHOTO'], ['CONTACT', 'ADMIN.CORRECTION_CONTACT'], ['LOCATION', 'ADMIN.CORRECTION_LOCATION'], ['RADIUS', 'ADMIN.CORRECTION_RADIUS'],
    ['PRICE', 'ADMIN.CORRECTION_PRICE'], ['BIO', 'ADMIN.CORRECTION_BIO'], ['PROPERTY', 'ADMIN.CORRECTION_PROPERTY'], ['ACTIVITIES', 'ADMIN.CORRECTION_ACTIVITIES'],
  ];
  readonly selectedCorrections = new Set<string>();
  readonly note = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] });
  provider: AdminProvider | null = null;
  isLoading = true;
  isSubmitting = false;
  dialogVisible = false;
  decision: Exclude<ReviewStatus, 'VERIFIED'> = 'CHANGES_REQUESTED';

  constructor(private route: ActivatedRoute, private router: Router, private adminService: AdminService, private messages: MessageService, public readonly translate: TranslateService) {}
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (id) this.load(id); else this.router.navigate(['/admin']); }
  load(id: string): void { this.adminService.getProvider(id).subscribe({ next: provider => { this.provider = provider; this.isLoading = false; }, error: error => { this.isLoading = false; this.messages.add({ severity: 'error', summary: this.translate.instant('ADMIN.ERROR'), detail: error?.error?.error || this.translate.instant('ADMIN.PROFILE_NOT_FOUND') }); this.router.navigate(['/admin']); } }); }
  initials(): string { return (this.provider?.fullName || '').split(/\s+/).slice(0, 2).map(value => value[0]).join('').toUpperCase(); }
  get primaryLocation(): string { const area = this.provider?.coverageAreas[0]; return area ? `${area.neighborhood}, ${area.city}` : this.translate.instant('ADMIN.NOT_INFORMED'); }
  get hourlyRate(): number | null { return this.provider?.services[0]?.basePrice ?? null; }
  get currencyCode(): 'BRL' | 'USD' { return this.translate.currentLang() === 'en' ? 'USD' : 'BRL'; }
  statusKey(status: string): string { return `ADMIN.STATUS_${status}`; }
  propertyKey(property: string): string { return `ADMIN.PROPERTY_${property}`; }
  openDecision(status: Exclude<ReviewStatus, 'VERIFIED'>): void { this.decision = status; this.selectedCorrections.clear(); this.note.reset(''); this.note.setValidators(status === 'REJECTED' ? [Validators.required, Validators.minLength(10), Validators.maxLength(500)] : [Validators.maxLength(500)]); this.note.updateValueAndValidity(); this.dialogVisible = true; }
  toggleCorrection(id: string): void { this.selectedCorrections.has(id) ? this.selectedCorrections.delete(id) : this.selectedCorrections.add(id); }
  selected(id: string): boolean { return this.selectedCorrections.has(id); }
  get canSubmit(): boolean { return this.note.valid && (this.decision === 'REJECTED' || this.selectedCorrections.size > 0); }
  submitDialog(): void { if (!this.provider || !this.canSubmit) return; const detail = this.note.value.trim(); const reviewNote = this.decision === 'CHANGES_REQUESTED' ? `${this.translate.instant('ADMIN.ITEMS_TO_CORRECT')}:\n${this.correctionOptions.filter(([id]) => this.selectedCorrections.has(id)).map(([, key]) => `- ${this.translate.instant(key)}`).join('\n')}${detail ? `\n\n${this.translate.instant('ADMIN.TEAM_GUIDANCE')}:\n${detail}` : ''}` : detail; this.review(this.decision, reviewNote); }
  review(status: ReviewStatus, note = ''): void { if (!this.provider) return; this.isSubmitting = true; this.adminService.reviewProvider(this.provider.id, status, note).subscribe({ next: response => { if (this.provider) { this.provider.verificationStatus = status; this.provider.verificationNote = note || null; } this.isSubmitting = false; this.dialogVisible = false; this.messages.add({ severity: 'success', summary: this.translate.instant('ADMIN.REVIEW_RECORDED'), detail: response.message }); }, error: error => { this.isSubmitting = false; this.messages.add({ severity: 'error', summary: this.translate.instant('ADMIN.ERROR'), detail: error?.error?.error || this.translate.instant('ADMIN.REVIEW_ERROR') }); } }); }
}
