import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics`);
  }

  getProviders(): Observable<ProviderProfile[]> {
    return this.http.get<ProviderProfile[]>(`${this.apiUrl}/providers`);
  }

  verifyProvider(id: string, isVerified: boolean): Observable<ProviderProfile> {
    return this.http.put<ProviderProfile>(`${this.apiUrl}/providers/${id}/verify`, { isVerified });
  }
}
