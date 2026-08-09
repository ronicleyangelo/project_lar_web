import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recommendation } from '../../../core/models/recommendation.model';

@Component({
  selector: 'app-provider-card',
  templateUrl: './provider-card.component.html',
  styleUrls: ['./provider-card.component.css']
})
export class ProviderCardComponent {
  @Input() recommendation!: Recommendation;
  @Input() searchNeighborhood: string = '';
  
  @Output() requestQuote = new EventEmitter<void>();
  @Output() showBreakdown = new EventEmitter<Recommendation>();
}
