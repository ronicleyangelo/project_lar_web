import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EditableClientProfile { id: string; email: string; phone: string; avatarUrl?: string | null; fullName: string; city: string; neighborhood: string; fullAddress: string; }

@Injectable({ providedIn: 'root' })
export class ClientProfileService {
  private readonly url = `${environment.apiUrl}/client/profile`;
  constructor(private readonly http: HttpClient) {}
  get(): Observable<EditableClientProfile> { return this.http.get<EditableClientProfile>(this.url); }
  update(payload: Omit<EditableClientProfile, 'id' | 'email' | 'avatarUrl'>): Observable<{ message: string; profile: EditableClientProfile }> { return this.http.put<{ message: string; profile: EditableClientProfile }>(this.url, payload); }
}
