import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import { ServiceRequest } from '../../../core/models/service-request.model';
import { ServiceActivity } from '../../../core/models/service-activity.model';
import { QuoteService } from '../../../core/services/quote.service';
import { RequestService } from '../../../core/services/request.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-provider-opportunities',
  templateUrl: './provider-opportunities.component.html',
  styleUrls: ['./provider-opportunities.component.css'],
})
export class ProviderOpportunitiesComponent implements OnInit {
  requests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  isLoading = true;
  isSending = false;
  quoteDialogVisible = false;

  readonly filters = this.formBuilder.nonNullable.group({
    city: [''],
    neighborhood: [''],
    activity: [''],
    date: [''],
    minBudget: [0],
  });

  readonly quoteForm = this.formBuilder.nonNullable.group({
    price: [100, [Validators.required, Validators.min(25)]],
    duration: ['4 horas', Validators.required],
    message: [
      'Olá! Tenho disponibilidade para realizar este serviço na data solicitada.',
      [Validators.required, Validators.minLength(10)],
    ],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly requestService: RequestService,
    private readonly quoteService: QuoteService,
    private readonly messageService: MessageService,
    public readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOpportunities();
  }

  get activities(): ServiceActivity[] {
    const unique = new Map<string, ServiceActivity>();
    this.requests.forEach(request =>
      request.activities?.forEach(item => unique.set(item.activity.id, item.activity)),
    );
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  get filteredRequests(): ServiceRequest[] {
    const filters = this.filters.getRawValue();
    const city = this.normalize(filters.city);
    const neighborhood = this.normalize(filters.neighborhood);

    return this.requests.filter(request =>
      (!city || this.normalize(request.city).includes(city)) &&
      (!neighborhood || this.normalize(request.neighborhood).includes(neighborhood)) &&
      (!filters.activity || request.activities?.some(item => item.activity.id === filters.activity)) &&
      (!filters.date || request.scheduledDate.slice(0, 10) === filters.date) &&
      (!filters.minBudget || (request.budgetLimit ?? 0) >= filters.minBudget),
    );
  }

  loadOpportunities(): void {
    this.isLoading = true;
    this.requestService
      .getProviderOpenRequests()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: requests => (this.requests = requests),
        error: error => this.showError(
          error,
          'Não foi possível carregar as oportunidades.',
        ),
      });
  }

  clearFilters(): void {
    this.filters.reset({
      city: '',
      neighborhood: '',
      activity: '',
      date: '',
      minBudget: 0,
    });
  }

  openQuote(request: ServiceRequest): void {
    const hours = this.suggestedHours(request);
    this.selectedRequest = request;
    this.quoteForm.reset({
      price: Math.max(25, hours * 25),
      duration: `${hours} horas`,
      message: 'Olá! Tenho disponibilidade para realizar este serviço na data solicitada.',
    });
    this.quoteDialogVisible = true;
  }

  submitQuote(): void {
    this.quoteForm.markAllAsTouched();
    if (!this.selectedRequest || this.quoteForm.invalid || this.isSending) return;

    const requestId = this.selectedRequest.id;
    const formValue = this.quoteForm.getRawValue();
    this.isSending = true;

    this.quoteService
      .send({
        requestId,
        price: formValue.price,
        estimatedDuration: formValue.duration.trim(),
        message: formValue.message.trim(),
      })
      .pipe(finalize(() => (this.isSending = false)))
      .subscribe({
        next: () => {
          this.requests = this.requests.filter(request => request.id !== requestId);
          this.quoteDialogVisible = false;
          this.selectedRequest = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Proposta enviada',
            detail: 'O cliente já pode analisar sua proposta.',
          });
        },
        error: error => {
          if (error?.status === 403 && String(error?.error?.error || '').includes('area de atendimento')) {
            this.requests = this.requests.filter(request => request.id !== requestId);
            this.quoteDialogVisible = false;
            this.selectedRequest = null;
            this.loadOpportunities();
          }
          this.showError(error, 'Não foi possível enviar a proposta.');
        },
      });
  }

  suggestedHours(request: ServiceRequest): number {
    const totalMinutes = (request.activities ?? []).reduce(
      (total, item) => total + (item.activity.suggestedMinutes ?? 0),
      0,
    );
    return Math.min(8, Math.max(2, Math.ceil(totalMinutes / 60) || 2));
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase('pt-BR');
  }

  private showError(error: any, fallback: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Oportunidades',
      detail: error?.error?.error || fallback,
    });
  }
}
