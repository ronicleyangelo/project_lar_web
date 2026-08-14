import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, CreateReviewPayload } from '../models/appointment.model';
import { EntityActionResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  create(payload: CreateReviewPayload): Observable<EntityActionResponse<Review>> {
    return this.http.post<EntityActionResponse<Review>>(this.apiUrl, payload);
  }
}
