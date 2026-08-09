import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote, SendQuotePayload } from '../models/service-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly apiUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  send(payload: SendQuotePayload): Observable<Quote> {
    return this.http.post<Quote>(this.apiUrl, payload);
  }

  accept(quoteId: string): Observable<Quote> {
    return this.http.post<Quote>(`${this.apiUrl}/${quoteId}/accept`, {});
  }
}
