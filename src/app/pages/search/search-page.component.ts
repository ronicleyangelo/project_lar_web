import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryService } from '../../core/services/category.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { AuthService } from '../../core/services/auth.service';
import { Recommendation, SearchParams } from '../../core/models/recommendation.model';
import { ActivityService } from '../../core/services/activity.service';
import { ServiceActivity } from '../../core/models/service-activity.model';

type SortOption = 'recommended' | 'distance' | 'price' | 'rating';

@Component({ selector: 'app-search-page', templateUrl: './search-page.component.html', styleUrls: ['./search-page.component.css'] })
export class SearchPageComponent implements OnInit {
  readonly budgetCeiling = 300;
  readonly ratingStars = [1, 2, 3, 4, 5];
  categoryId = '';
  filtersOpen = false;
  searchError = '';
  isSearching = false;
  hasSearched = false;
  sortBy: SortOption = 'recommended';
  recommendations: Recommendation[] = [];
  activities: ServiceActivity[] = [];
  selectedProviderBreakdown: Recommendation | null = null;
  showBreakdown = false;

  readonly form = this.formBuilder.nonNullable.group({
    city: ['', Validators.required],
    neighborhood: [''],
    propertyType: [''],
    hasPets: [false],
    minRating: [0],
    maxBudget: [0, [Validators.min(0), Validators.max(this.budgetCeiling)]],
    activityIds: [[] as string[]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private activityService: ActivityService,
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(categories => this.categoryId = categories[0]?.id || '');
    this.activityService.list().subscribe(activities => this.activities = activities);
    const profile = this.authService.currentUserValue?.profile;
    if (profile?.city && profile?.neighborhood) this.form.patchValue({ city: profile.city, neighborhood: profile.neighborhood });
  }

  get displayedRecommendations(): Recommendation[] {
    const items = [...this.recommendations];
    if (this.sortBy === 'distance') return items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    if (this.sortBy === 'price') return items.sort((a, b) => this.basePrice(a) - this.basePrice(b));
    if (this.sortBy === 'rating') return items.sort((a, b) => b.provider.trustScore - a.provider.trustScore);
    return items.sort((a, b) => b.totalScore - a.totalScore);
  }

  get maxBudget(): number { return this.form.controls.maxBudget.value; }
  get minimumRating(): number { return this.form.controls.minRating.value; }
  get minimumRatingLabel(): string { return this.minimumRating > 0 ? `${this.minimumRating}+ estrelas` : 'Qualquer avaliação'; }
  get maxBudgetPercent(): number { return (this.maxBudget / this.budgetCeiling) * 100; }
  get searchNeighborhood(): string { return this.form.controls.neighborhood.value; }
  get searchLocationLabel(): string { return this.searchNeighborhood.trim() || this.form.controls.city.value.trim(); }
  get filterToggleLabel(): string { return this.filtersOpen ? 'Fechar filtros' : 'Filtros de busca'; }
  get budgetLabel(): string { return this.maxBudget === 0 ? 'Sem limite' : `Até R$ ${this.maxBudget}/h`; }
  get searchButtonLabel(): string { return this.isSearching ? 'Buscando...' : 'Buscar profissionais'; }
  get resultsTitle(): string { return this.hasSearched ? 'Resultados da busca' : 'Comece pela sua localização'; }
  get showResultsTools(): boolean { return this.hasSearched && this.recommendations.length > 0; }
  get showResults(): boolean { return !this.isSearching && this.displayedRecommendations.length > 0; }
  get showEmptyResults(): boolean { return !this.isSearching && this.hasSearched && this.recommendations.length === 0; }
  get showSearchIntro(): boolean { return !this.isSearching && !this.hasSearched; }

  runSearch(): void {
    if (this.form.invalid || !this.categoryId) {
      this.form.markAllAsTouched();
      this.searchError = this.categoryId ? 'Informe a cidade para realizar a busca.' : 'A categoria de limpeza ainda não está disponível.';
      return;
    }
    this.searchError = '';
    this.isSearching = true;
    const value = this.form.getRawValue();
    const params: SearchParams = {
      categoryId: this.categoryId,
      city: value.city.trim(),
      neighborhood: value.neighborhood.trim(),
      maxBudget: value.maxBudget > 0 ? value.maxBudget : undefined,
      propertyType: value.propertyType || undefined,
      hasPets: value.hasPets,
      minRating: value.minRating > 0 ? value.minRating : undefined,
      activityIds: value.activityIds.length ? value.activityIds : undefined,
    };
    this.recommendationService.search(params).pipe(finalize(() => { this.isSearching = false; this.hasSearched = true; })).subscribe({
      next: results => { this.recommendations = results; this.filtersOpen = false; },
      error: error => { this.recommendations = []; this.searchError = error?.error?.error || 'Não foi possível buscar profissionais agora.'; },
    });
  }

  clearFilters(): void {
    this.form.reset({ city: '', neighborhood: '', propertyType: '', hasPets: false, minRating: 0, maxBudget: 0, activityIds: [] });
    this.recommendations = [];
    this.hasSearched = false;
    this.searchError = '';
  }

  toggleFilters(): void { this.filtersOpen = !this.filtersOpen; }
  setMinimumRating(value: number): void { this.form.controls.minRating.setValue(value); }
  toggleActivity(id: string, checked: boolean): void {
    const control = this.form.controls.activityIds;
    control.setValue(checked ? Array.from(new Set([...control.value, id])) : control.value.filter(item => item !== id));
  }
  onShowBreakdown(item: Recommendation): void { this.selectedProviderBreakdown = item; this.showBreakdown = true; }
  onRequestQuote(): void { this.router.navigate([this.authService.currentUserValue ? '/client' : '/auth/login']); }

  private basePrice(item: Recommendation): number {
    return item.provider.services?.find(service => service.categoryId === this.categoryId)?.basePrice ?? Infinity;
  }
}
