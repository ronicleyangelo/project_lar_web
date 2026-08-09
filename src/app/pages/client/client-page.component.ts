import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../core/services/request.service';
import { QuoteService } from '../../core/services/quote.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ReviewService } from '../../core/services/review.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Category } from '../../core/models/category.model';
import { ServiceRequest, CreateRequestPayload } from '../../core/models/service-request.model';
import { Appointment, CreateReviewPayload } from '../../core/models/appointment.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.css']
})
export class ClientPageComponent implements OnInit {
  clientRequests: ServiceRequest[] = [];
  appointments: Appointment[] = [];
  categories: Category[] = [];
  
  showNewRequestModal: boolean = false;
  newReqCategoryId = '';
  newReqDate = '';
  newReqTimeSlot = 'Manhã (08:00 - 12:00)';
  newReqBudget?: number;
  newReqDescription = '';
  newReqCity = 'São Paulo';
  newReqNeighborhood = 'Moema';
  private currentModalRef: NgbModalRef | null = null;
  
  showRatingModal: boolean = false;
  selectedAppointmentId: string = '';

  constructor(
    private requestService: RequestService,
    private quoteService: QuoteService,
    private appointmentService: AppointmentService,
    private reviewService: ReviewService,
    private categoryService: CategoryService,
    public authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadClientRequests();
    this.loadAppointments();
    this.loadCategories();
  }

  loadClientRequests() {
    this.requestService.getClientRequests().subscribe(reqs => this.clientRequests = reqs);
  }

  loadAppointments() {
    this.appointmentService.getAll().subscribe(apps => this.appointments = apps);
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
      if (!this.newReqCategoryId && cats.length > 0) {
        this.newReqCategoryId = cats[0].id;
      }
    });
  }

  openNewRequestModal(contentTemplate: any) {
    this.currentModalRef = this.modalService.open(contentTemplate, { 
      centered: true, 
      windowClass: 'premium-modal',
      size: 'lg'
    });
  }

  submitNewRequest() {
    const payload: CreateRequestPayload = {
      categoryId: this.newReqCategoryId,
      city: this.newReqCity,
      neighborhood: this.newReqNeighborhood,
      scheduledDate: this.newReqDate || new Date().toISOString().split('T')[0],
      timeSlot: this.newReqTimeSlot,
      budgetLimit: this.newReqBudget,
      description: this.newReqDescription
    };
    this.requestService.create(payload).subscribe(() => {
      if (this.currentModalRef) {
        this.currentModalRef.close();
      }
      this.newReqDescription = '';
      this.loadClientRequests();
    });
  }

  acceptQuote(quoteId: string) {
    this.quoteService.accept(quoteId).subscribe(() => {
      this.loadClientRequests();
      this.loadAppointments();
    });
  }

  confirmCompletion(id: string) {
    this.appointmentService.confirmCompletion(id).subscribe(() => {
      this.loadAppointments();
      this.loadClientRequests();
    });
  }

  openRating(appId: string) {
    this.selectedAppointmentId = appId;
    this.showRatingModal = true;
  }

  onSubmitReview(payload: CreateReviewPayload) {
    const review: CreateReviewPayload = {
      ...payload,
      appointmentId: this.selectedAppointmentId
    };
    this.reviewService.create(review).subscribe(() => {
      this.showRatingModal = false;
      this.loadAppointments();
    });
  }
}
