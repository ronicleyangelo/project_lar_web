import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { AdminMetrics, AdminProvider } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<AdminMetrics> {
    return this.http.get<{ metrics: AdminMetrics }>(`${this.apiUrl}/metrics`).pipe(map(response => response.metrics));
  }

  getProviders(): Observable<AdminProvider[]> {
    return this.http.get<AdminProvider[]>(`${this.apiUrl}/providers`);
  }

  getProvider(id: string): Observable<AdminProvider> {
    return this.http.get<AdminProvider>(`${this.apiUrl}/providers/${id}`);
  }

  reviewProvider(id: string, status: 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED', note = ''): Observable<any> {
    return this.http.put(`${this.apiUrl}/providers/${id}/verification`, { status, note });
  }
}
