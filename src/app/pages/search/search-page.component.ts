import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { AuthService } from '../../core/services/auth.service';
import { Category } from '../../core/models/category.model';
import { Recommendation, SearchParams } from '../../core/models/recommendation.model';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
  categories: Category[] = [];
  selectedCategoryId: string = '';
  searchCity = '';
  searchNeighborhood = '';
  minBudget = 0;
  maxBudget = 1000;
  readonly budgetCeiling = 2000;
  filtersOpen = false;
  searchError = '';
  
  recommendations: Recommendation[] = [];
  selectedProviderBreakdown: Recommendation | null = null;
  showBreakdown: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
      if (cats.length > 0) {
        this.selectedCategoryId = cats[0].id;
      }
    });
  }

  runSearch(): void {
    if (!this.selectedCategoryId) return;
    if (!this.searchCity.trim() || !this.searchNeighborhood.trim()) {
      this.searchError = 'Informe a cidade e o bairro para realizar a busca.';
      return;
    }
    this.searchError = '';
    const params: SearchParams = {
      categoryId: this.selectedCategoryId,
      city: this.searchCity,
      neighborhood: this.searchNeighborhood,
      minBudget: this.minBudget,
      maxBudget: this.maxBudget
    };
    this.recommendationService.search(params).subscribe(results => {
      this.recommendations = results;
    });
  }

  get minBudgetPercent(): number {
    return (this.minBudget / this.budgetCeiling) * 100;
  }

  get maxBudgetPercent(): number {
    return (this.maxBudget / this.budgetCeiling) * 100;
  }

  onMinBudgetChange(): void {
    if (this.minBudget > this.maxBudget) {
      this.maxBudget = this.minBudget;
    }
  }

  onMaxBudgetChange(): void {
    if (this.maxBudget < this.minBudget) {
      this.minBudget = this.maxBudget;
    }
  }

  clearFilters(): void {
    this.searchCity = '';
    this.searchNeighborhood = '';
    this.minBudget = 0;
    this.maxBudget = 1000;
    this.searchError = '';
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  onShowBreakdown(rec: Recommendation): void {
    this.selectedProviderBreakdown = rec;
    this.showBreakdown = true;
  }

  onRequestQuote(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
