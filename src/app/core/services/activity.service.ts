import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceActivity } from '../models/service-activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private http: HttpClient) {}
  list(): Observable<ServiceActivity[]> { return this.http.get<ServiceActivity[]>(`${environment.apiUrl}/activities`); }
}
