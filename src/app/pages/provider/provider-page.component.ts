import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../core/services/request.service';
import { QuoteService } from '../../core/services/quote.service';
import { ServiceRequest, SendQuotePayload } from '../../core/models/service-request.model';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-provider-page',
  templateUrl: './provider-page.component.html',
  styleUrls: ['./provider-page.component.css']
})
export class ProviderPageComponent implements OnInit {
  openProviderRequests: ServiceRequest[] = [];
  appointments: Appointment[] = [];
  
  showQuoteModal: boolean = false;
  quoteRequestId: string = '';
  quotePrice: number = 150;
  quoteDuration: string = '4 horas';
  quoteMessage: string = 'Olá! Posso realizar o serviço na data solicitada.';
  private currentModalRef: NgbModalRef | null = null;

  constructor(
    private requestService: RequestService,
    private quoteService: QuoteService,
    private appointmentService: AppointmentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadProviderOpenRequests();
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getAll().subscribe(apps => this.appointments = apps);
  }

  loadProviderOpenRequests() {
    this.requestService.getProviderOpenRequests().subscribe(reqs => {
      this.openProviderRequests = reqs;
    });
  }

  openSendQuoteModal(reqId: string, contentTemplate: any) {
    this.quoteRequestId = reqId;
    this.quotePrice = 150;
    this.quoteDuration = '4 horas';
    this.quoteMessage = 'Olá! Posso realizar o serviço na data solicitada.';
    this.currentModalRef = this.modalService.open(contentTemplate, { 
      centered: true, 
      windowClass: 'premium-modal',
      size: 'md' 
    });
  }

  submitQuote() {
    const payload: SendQuotePayload = {
      requestId: this.quoteRequestId,
      price: this.quotePrice,
      estimatedDuration: this.quoteDuration,
      message: this.quoteMessage
    };
    this.quoteService.send(payload).subscribe(() => {
      if (this.currentModalRef) {
        this.currentModalRef.close();
      }
      this.loadProviderOpenRequests();
    });
  }

  completeAppointment(id: string) {
    this.appointmentService.complete(id).subscribe(() => {
      this.loadAppointments();
    });
  }

  startAppointment(id: string) {
    this.appointmentService.start(id).subscribe(() => {
      this.loadAppointments();
    });
  }
}
