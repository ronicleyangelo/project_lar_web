import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from '../../core/services/request.service';
import { QuoteService } from '../../core/services/quote.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ReviewService } from '../../core/services/review.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Category } from '../../core/models/category.model';
import { ServiceRequest, CreateRequestPayload } from '../../core/models/service-request.model';
import { Appointment, CreateReviewPayload } from '../../core/models/appointment.model';

@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.css']
})
export class ClientPageComponent implements OnInit {
  clientRequests: ServiceRequest[] = [];
  appointments: Appointment[] = [];
  categories: Category[] = [];

  newReqCategoryId = '';
  newReqDate = '';
  newReqTimeSlot = 'Manhã (08:00 - 12:00)';
  newReqBudget?: number;
  newReqDescription = '';
  newReqCity = 'São Paulo';
  newReqNeighborhood = 'Moema';
  private currentModalRef: NgbModalRef | null = null;

  showRatingModal = false;
  selectedAppointmentId = '';
  isCreatingRequest = false;
  isSubmittingReview = false;
  private readonly acceptingQuoteIds = new Set<string>();
  private readonly confirmingAppointmentIds = new Set<string>();

  constructor(
    private requestService: RequestService,
    private quoteService: QuoteService,
    private appointmentService: AppointmentService,
    private reviewService: ReviewService,
    private categoryService: CategoryService,
    public authService: AuthService,
    private modalService: NgbModal,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadClientRequests();
    this.loadAppointments();
    this.loadCategories();
  }

  loadClientRequests(): void {
    this.requestService.getClientRequests().subscribe({
      next: requests => this.clientRequests = requests,
      error: error => this.showError(error, 'Não foi possível carregar seus pedidos.')
    });
  }

  loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: appointments => this.appointments = appointments,
      error: error => this.showError(error, 'Não foi possível carregar seus agendamentos.')
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: categories => {
        this.categories = categories;
        if (!this.newReqCategoryId && categories.length > 0) this.newReqCategoryId = categories[0].id;
      },
      error: error => this.showError(error, 'Não foi possível carregar as categorias.')
    });
  }

  openNewRequestModal(contentTemplate: any): void {
    this.currentModalRef = this.modalService.open(contentTemplate, {
      centered: true,
      windowClass: 'premium-modal',
      size: 'lg'
    });
  }

  submitNewRequest(): void {
    if (this.isCreatingRequest) return;
    if (!this.newReqCategoryId || !this.newReqDescription.trim() || !this.newReqCity.trim() || !this.newReqNeighborhood.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Preencha categoria, localização e descrição.' });
      return;
    }

    const payload: CreateRequestPayload = {
      categoryId: this.newReqCategoryId,
      city: this.newReqCity.trim(),
      neighborhood: this.newReqNeighborhood.trim(),
      scheduledDate: this.newReqDate || new Date().toISOString().split('T')[0],
      timeSlot: this.newReqTimeSlot,
      budgetLimit: this.newReqBudget,
      description: this.newReqDescription.trim()
    };

    this.isCreatingRequest = true;
    this.requestService.create(payload).pipe(
      finalize(() => this.isCreatingRequest = false)
    ).subscribe({
      next: response => {
        this.currentModalRef?.close();
        this.currentModalRef = null;
        this.newReqDescription = '';
        this.clientRequests = [
          response.serviceRequest,
          ...this.clientRequests.filter(request => request.id !== response.serviceRequest.id)
        ];
        this.messageService.add({
          severity: response.deduplicated ? 'info' : 'success',
          summary: response.deduplicated ? 'Pedido já existente' : 'Pedido publicado',
          detail: response.message
        });
      },
      error: error => this.showError(error, 'Não foi possível publicar o pedido.')
    });
  }

  acceptQuote(quoteId: string): void {
    if (this.acceptingQuoteIds.has(quoteId)) return;
    this.acceptingQuoteIds.add(quoteId);
    this.quoteService.accept(quoteId).pipe(
      finalize(() => this.acceptingQuoteIds.delete(quoteId))
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Proposta aceita', detail: 'O agendamento foi criado.' });
        this.loadClientRequests();
        this.loadAppointments();
      },
      error: error => this.showError(error, 'Não foi possível aceitar a proposta.')
    });
  }

  isAcceptingQuote(quoteId: string): boolean {
    return this.acceptingQuoteIds.has(quoteId);
  }

  confirmCompletion(id: string): void {
    if (this.confirmingAppointmentIds.has(id)) return;
    this.confirmingAppointmentIds.add(id);
    this.appointmentService.confirmCompletion(id).pipe(
      finalize(() => this.confirmingAppointmentIds.delete(id))
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Serviço concluído', detail: 'Agora você já pode avaliar o profissional.' });
        this.loadAppointments();
        this.loadClientRequests();
      },
      error: error => this.showError(error, 'Não foi possível confirmar a conclusão.')
    });
  }

  isConfirmingAppointment(id: string): boolean {
    return this.confirmingAppointmentIds.has(id);
  }

  openRating(appointmentId: string): void {
    this.selectedAppointmentId = appointmentId;
    this.showRatingModal = true;
  }

  onSubmitReview(payload: CreateReviewPayload): void {
    if (this.isSubmittingReview) return;
    this.isSubmittingReview = true;
    this.reviewService.create({ ...payload, appointmentId: this.selectedAppointmentId }).pipe(
      finalize(() => this.isSubmittingReview = false)
    ).subscribe({
      next: () => {
        this.showRatingModal = false;
        this.messageService.add({ severity: 'success', summary: 'Avaliação enviada', detail: 'Obrigado pela sua avaliação.' });
        this.loadAppointments();
      },
      error: error => this.showError(error, 'Não foi possível enviar a avaliação.')
    });
  }

  private showError(error: any, fallback: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.error || fallback });
  }
}
