import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BetaService {
  constructor(private http: HttpClient) {}

  sendFeedback(category: string, message: string, pageUrl: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/beta/feedback`, { category, message, pageUrl });
  }
}
