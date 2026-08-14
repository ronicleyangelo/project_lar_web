import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote, SendQuotePayload } from '../models/service-request.model';
import { Appointment } from '../models/appointment.model';
import { EntityActionResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly apiUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  send(payload: SendQuotePayload): Observable<EntityActionResponse<Quote>> {
    return this.http.post<EntityActionResponse<Quote>>(this.apiUrl, payload);
  }

  accept(quoteId: string): Observable<EntityActionResponse<Appointment>> {
    return this.http.post<EntityActionResponse<Appointment>>(`${this.apiUrl}/${quoteId}/accept`, {});
  }
}
