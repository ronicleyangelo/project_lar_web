import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  complete(id: string): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/${id}/complete`, {});
  }

  start(id: string): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/${id}/start`, {});
  }

  confirmCompletion(id: string): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/${id}/confirm-completion`, {});
  }
}
