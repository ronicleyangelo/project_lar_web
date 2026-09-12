import { Component, OnInit, HostBinding, HostListener } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from '../../../core/services/request.service';
import { QuoteService } from '../../../core/services/quote.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ServiceRequest, SendQuotePayload } from '../../../core/models/service-request.model';
import { Appointment } from '../../../core/models/appointment.model';
import { APPOINTMENT_STATUS_VIEWS } from '../../../core/presentation/lifecycle-view';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-provider-page',
  templateUrl: './provider-page.component.html',
  styleUrls: ['./provider-page.component.css']
})
export class ProviderPageComponent implements OnInit {
  @HostBinding('class.maximized') get isMaximized() { return !!this.maximizedTable; }
  readonly appointmentStatusViews = APPOINTMENT_STATUS_VIEWS;
  openProviderRequests: ServiceRequest[] = [];
  isLoadingRequests = true;
  appointments: Appointment[] = [];
  isLoadingAppointments = true;
  mercadoPagoConnected = false;
  isConnectingMercadoPago = false;
  quoteRequestId = '';
  quotePrice = 150;
  quoteDuration = '4 horas';
  quoteMessage = 'Olá! Posso realizar o serviço na data solicitada.';
  isSendingQuote = false;
  searchOpenRequests = false;
  searchOpenAppointments = false;
  maximizedTable: string | null = null;

  toggleTableSearch(tableId: 'requests' | 'appointments'): void {
    if (tableId === 'requests') {
      this.searchOpenRequests = !this.searchOpenRequests;
      return;
    }
    this.searchOpenAppointments = !this.searchOpenAppointments;
  }

  toggleMaximize(tableId: string) {
    this.maximizedTable = this.maximizedTable === tableId ? null : tableId;
  }

  @HostListener('document:keydown.escape')
  restoreTable(): void {
    this.maximizedTable = null;
  }
  private currentModalRef: NgbModalRef | null = null;
  private readonly appointmentActionIds = new Set<string>();

  constructor(
    private requestService: RequestService,
    private quoteService: QuoteService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private modalService: NgbModal,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProviderOpenRequests();
    this.loadAppointments();
    this.loadPaymentConnection();
  }

  loadPaymentConnection(): void {
    this.paymentService.connectionStatus().subscribe({
      next: result => this.mercadoPagoConnected = result.connected,
      error: () => this.mercadoPagoConnected = false,
    });
  }

  connectMercadoPago(): void {
    if (this.isConnectingMercadoPago) return;
    this.isConnectingMercadoPago = true;
    this.paymentService.connect().pipe(finalize(() => this.isConnectingMercadoPago = false)).subscribe({
      next: result => window.location.assign(result.authorizationUrl),
      error: error => this.showError(error, 'Não foi possível conectar ao Mercado Pago.'),
    });
  }

  loadAppointments(): void {
    this.isLoadingAppointments = true;
    this.appointmentService.getAll().pipe(finalize(() => this.isLoadingAppointments = false)).subscribe({
      next: appointments => this.appointments = appointments,
      error: error => this.showError(error, 'Não foi possível carregar os agendamentos.')
    });
  }

  loadProviderOpenRequests(): void {
    this.isLoadingRequests = true;
    this.requestService.getProviderOpenRequests().pipe(finalize(() => this.isLoadingRequests = false)).subscribe({
      next: requests => this.openProviderRequests = requests,
      error: error => this.showError(error, 'Não foi possível carregar os pedidos disponíveis.')
    });
  }

  openSendQuoteModal(requestId: string, contentTemplate: any): void {
    this.quoteRequestId = requestId;
    this.quotePrice = 150;
    this.quoteDuration = '4 horas';
    this.quoteMessage = 'Olá! Posso realizar o serviço na data solicitada.';
    this.currentModalRef = this.modalService.open(contentTemplate, {
      centered: true,
      windowClass: 'premium-modal',
      size: 'md'
    });
  }

  submitQuote(): void {
    if (this.isSendingQuote) return;
    if (!this.quoteRequestId || this.quotePrice <= 0 || !this.quoteDuration.trim() || !this.quoteMessage.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Informe preço, duração e mensagem.' });
      return;
    }

    const payload: SendQuotePayload = {
      requestId: this.quoteRequestId,
      price: this.quotePrice,
      estimatedDuration: this.quoteDuration.trim(),
      message: this.quoteMessage.trim()
    };
    this.isSendingQuote = true;
    this.quoteService.send(payload).pipe(
      finalize(() => this.isSendingQuote = false)
    ).subscribe({
      next: () => {
        this.currentModalRef?.close();
        this.currentModalRef = null;
        this.openProviderRequests = this.openProviderRequests.filter(request => request.id !== payload.requestId);
        this.messageService.add({ severity: 'success', summary: 'Proposta enviada', detail: 'O cliente já pode analisar seu orçamento.' });
      },
      error: error => {
        if (error?.status === 403 && String(error?.error?.error || '').includes('area de atendimento')) {
          this.openProviderRequests = this.openProviderRequests.filter(request => request.id !== payload.requestId);
          this.currentModalRef?.close();
          this.currentModalRef = null;
          this.loadProviderOpenRequests();
        }
        this.showError(error, 'Não foi possível enviar a proposta.');
      }
    });
  }

  startAppointment(id: string): void {
    this.runAppointmentAction(id, () => this.appointmentService.start(id), 'Serviço iniciado.');
  }

  completeAppointment(id: string): void {
    this.runAppointmentAction(id, () => this.appointmentService.complete(id), 'Execução informada ao cliente.');
  }

  isAppointmentActionRunning(id: string): boolean {
    return this.appointmentActionIds.has(id);
  }

  onClientAvatarError(appointment: Appointment): void {
    // URLs externas podem expirar ou recusar hotlink. Ao limpar a URL, o
    // template troca a imagem quebrada pelo avatar com a inicial do cliente.
    if (appointment.client?.user) appointment.client.user.avatarUrl = null;
  }

  private runAppointmentAction(id: string, action: () => ReturnType<AppointmentService['start']>, successMessage: string): void {
    if (this.appointmentActionIds.has(id)) return;
    this.appointmentActionIds.add(id);
    action().pipe(
      finalize(() => this.appointmentActionIds.delete(id))
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Agendamento atualizado', detail: successMessage });
        this.loadAppointments();
      },
      error: error => this.showError(error, 'Não foi possível atualizar o agendamento.')
    });
  }

  private showError(error: any, fallback: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.error || fallback });
  }
}





