import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountSettings } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly apiUrl = `${environment.apiUrl}/account`;
  constructor(private http: HttpClient) {}

  get(): Observable<AccountSettings> {
    return this.http.get<AccountSettings>(this.apiUrl);
  }

  updatePrivacy(profileVisible: boolean, allowRecommendations: boolean): Observable<{ profileVisible: boolean; allowRecommendations: boolean }> {
    return this.http.put<{ profileVisible: boolean; allowRecommendations: boolean }>(`${this.apiUrl}/privacy`, { profileVisible, allowRecommendations });
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/password`, { currentPassword, newPassword });
  }

  requestDeletion(confirmation: string, currentPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/deletion`, { confirmation, currentPassword });
  }

  cancelDeletion(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/deletion`);
  }
}
