import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceRequest, CreateRequestPayload, CreateRequestResponse } from '../models/service-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  create(payload: CreateRequestPayload): Observable<CreateRequestResponse> {
    return this.http.post<CreateRequestResponse>(this.apiUrl, payload);
  }

  getClientRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/client`);
  }

  getProviderOpenRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/provider/open`);
  }
}
