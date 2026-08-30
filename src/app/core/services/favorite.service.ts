import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly apiUrl = `${environment.apiUrl}/client/favorites`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<string[]> { return this.http.get<string[]>(this.apiUrl); }
  add(providerId: string): Observable<{ providerId: string; isFavorite: true }> {
    return this.http.post<{ providerId: string; isFavorite: true }>(`${this.apiUrl}/${providerId}`, {});
  }
  remove(providerId: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${providerId}`); }
}
