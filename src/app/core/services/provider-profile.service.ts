import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EditableProviderProfile, UpdateProviderProfilePayload } from '../models/provider-profile.model';

@Injectable({ providedIn: 'root' })
export class ProviderProfileService {
  private readonly apiUrl = `${environment.apiUrl}/provider/profile`;

  constructor(private http: HttpClient) {}

  get(): Observable<EditableProviderProfile> {
    return this.http.get<EditableProviderProfile>(this.apiUrl);
  }

  update(payload: UpdateProviderProfilePayload): Observable<EditableProviderProfile> {
    return this.http.put<EditableProviderProfile>(this.apiUrl, payload);
  }

  submitForReview(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/submit-review`, {});
  }
}
