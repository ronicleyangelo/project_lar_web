import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Recommendation } from '../../../core/models/recommendation.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-provider-card',
  templateUrl: './provider-card.component.html',
  styleUrls: ['./provider-card.component.css']
})
export class ProviderCardComponent implements OnChanges {
  @Input() recommendation!: Recommendation;
  @Input() searchNeighborhood: string = '';
  @Input() isFavorite = false;
  @Input() favoritePending = false;
  
  @Output() requestQuote = new EventEmitter<string>();
  @Output() favoriteChange = new EventEmitter<string>();

  displayTags: string[] = [];

  constructor(public readonly translate: TranslateService) {}

  get currencyCode(): 'BRL' | 'USD' { return this.translate.currentLang() === 'en' ? 'USD' : 'BRL'; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['recommendation']) {
      this.setupTags();
    }
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (!this.favoritePending) this.favoriteChange.emit(this.recommendation.provider.id);
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
      tags.push('PETS');
    }
    
    // Limita a exibição a 3 tags para manter o card limpo
    this.displayTags = tags.slice(0, 3);
  }
}
