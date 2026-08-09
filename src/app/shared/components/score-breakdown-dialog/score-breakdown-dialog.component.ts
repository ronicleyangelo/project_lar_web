import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recommendation } from '../../../core/models/recommendation.model';

@Component({
  selector: 'app-score-breakdown-dialog',
  templateUrl: './score-breakdown-dialog.component.html',
  styleUrls: ['./score-breakdown-dialog.component.css']
})
export class ScoreBreakdownDialogComponent {
  @Input() visible: boolean = false;
  @Input() recommendation: Recommendation | null = null;
  
  @Output() visibleChange = new EventEmitter<boolean>();

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
