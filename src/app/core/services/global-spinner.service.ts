import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalSpinnerService {
  private requestCount = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  public isLoading$ = this.isLoadingSubject.asObservable();

  show() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.isLoadingSubject.next(true);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoadingSubject.next(false);
    }
  }

  // Permite forçar o fechamento (ex: navegação de rotas com erro)
  forceHide() {
    this.requestCount = 0;
    this.isLoadingSubject.next(false);
  }
}
