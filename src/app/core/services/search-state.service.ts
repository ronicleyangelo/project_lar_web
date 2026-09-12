import { Injectable } from '@angular/core';

export interface SearchState {
  results: any[];
  filters: any;
  sortBy: string;
  hasSearched: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private lastResults: any[] | null = null;
  private lastFilters: any = null;
  private hasSearched: boolean = false;
  private lastSortBy: string = 'recommended';

  setSearchState(results: any[], filters: any, sortBy: string) {
    this.lastResults = results;
    this.lastFilters = filters;
    this.lastSortBy = sortBy;
    this.hasSearched = true;
  }

  getSearchState(): SearchState | null {
    if (!this.hasSearched) return null;
    return {
      results: this.lastResults || [],
      filters: this.lastFilters,
      sortBy: this.lastSortBy,
      hasSearched: this.hasSearched
    };
  }

  clearState() {
    this.lastResults = null;
    this.lastFilters = null;
    this.hasSearched = false;
    this.lastSortBy = 'recommended';
  }
}
