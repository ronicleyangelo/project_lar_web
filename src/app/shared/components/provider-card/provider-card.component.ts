import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Recommendation } from '../../../core/models/recommendation.model';

@Component({
  selector: 'app-provider-card',
  templateUrl: './provider-card.component.html',
  styleUrls: ['./provider-card.component.css']
})
export class ProviderCardComponent implements OnChanges {
  @Input() recommendation!: Recommendation;
  @Input() searchNeighborhood: string = '';
  
  @Output() requestQuote = new EventEmitter<void>();
  @Output() showBreakdown = new EventEmitter<Recommendation>();

  isFavorite: boolean = false;
  displayTags: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['recommendation']) {
      this.setupTags();
    }
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
  }

  get matchText(): string {
    const score = this.recommendation?.totalScore || 0;
    if (score >= 85) return 'Excelente combinação';
    if (score >= 70) return 'Boa combinação';
    return 'Compatível';
  }

  private setupTags() {
    if (!this.recommendation || !this.recommendation.provider) return;
    
    const provider = this.recommendation.provider;
    const tags: string[] = [];
    
    // Extrai tipos de imóveis
    if (provider.propertyTypes?.length) {
      tags.push(...provider.propertyTypes);
    }
    
    // Adiciona flag de pets se for true
    if (provider.acceptsPets) {
      tags.push('Aceita pets');
    }
    
    // Limita a exibição a 3 tags para manter o card limpo
    this.displayTags = tags.slice(0, 3);
  }
}
