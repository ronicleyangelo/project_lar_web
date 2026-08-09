import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CreateReviewPayload } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-rating-dialog',
  templateUrl: './rating-dialog.component.html',
  styleUrls: ['./rating-dialog.component.css']
})
export class RatingDialogComponent {
  @Input() visible: boolean = false;
  @Input() appointmentId!: string;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submitReview = new EventEmitter<CreateReviewPayload>();

  quality: number = 0;
  punctuality: number = 0;
  communication: number = 0;
  care: number = 0;
  costBenefit: number = 0;
  comment: string = '';

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onSubmit() {
    this.submitReview.emit({
      appointmentId: this.appointmentId,
      qualityRating: this.quality,
      punctualityRating: this.punctuality,
      communicationRating: this.communication,
      careRating: this.care,
      costBenefitRating: this.costBenefit,
      comment: this.comment
    });
    this.closeDialog();
  }

  isFormValid(): boolean {
    return this.quality > 0 && this.punctuality > 0 && 
           this.communication > 0 && this.care > 0 && 
           this.costBenefit > 0;
  }
}
