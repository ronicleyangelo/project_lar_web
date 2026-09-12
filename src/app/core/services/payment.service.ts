import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentSummary {
  id: string;
  amount: number;
  platformFee: number;
  providerAmount: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;
  constructor(private http: HttpClient) {}

  connectionStatus(): Observable<{ connected: boolean; testMode: boolean }> {
    return this.http.get<{ connected: boolean; testMode: boolean }>(`${this.apiUrl}/mercado-pago/status`);
  }

  connect(): Observable<{ authorizationUrl: string }> {
    return this.http.post<{ authorizationUrl: string }>(`${this.apiUrl}/mercado-pago/connect`, {});
  }

  createCheckout(appointmentId: string): Observable<{ checkoutUrl: string; payment: PaymentSummary }> {
    return this.http.post<{ checkoutUrl: string; payment: PaymentSummary }>(`${this.apiUrl}/appointments/${appointmentId}/checkout`, {});
  }
}
