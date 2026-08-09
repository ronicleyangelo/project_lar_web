import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recommendation, SearchParams } from '../models/recommendation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly apiUrl = `${environment.apiUrl}/requests/recommendations`;

  constructor(private http: HttpClient) {}

  search(params: SearchParams): Observable<Recommendation[]> {
    let httpParams = new HttpParams()
      .set('categoryId', params.categoryId)
      .set('city', params.city)
      .set('neighborhood', params.neighborhood);

    if (params.minBudget !== undefined) {
      httpParams = httpParams.set('minBudget', params.minBudget.toString());
    }
    if (params.maxBudget !== undefined) {
      httpParams = httpParams.set('maxBudget', params.maxBudget.toString());
    }

    return this.http.get<Recommendation[]>(this.apiUrl, { params: httpParams });
  }
}
