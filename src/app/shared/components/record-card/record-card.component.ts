import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-record-card',
  templateUrl: './record-card.component.html',
  styleUrls: ['./record-card.component.css'],
})
export class RecordCardComponent {
  @Input() tone: 'primary' | 'secondary' | 'neutral' = 'neutral';
}
