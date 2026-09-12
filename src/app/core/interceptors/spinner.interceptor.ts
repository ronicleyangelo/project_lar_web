import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GlobalSpinnerService } from '../services/global-spinner.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private spinnerService: GlobalSpinnerService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ignorar requisições silenciosas se enviarmos o header X-Silent-Request, por exemplo.
    // Mas por padrão, todas mostrarão o spinner.
    if (request.headers.has('X-Silent-Request')) {
      const clonedReq = request.clone({ headers: request.headers.delete('X-Silent-Request') });
      return next.handle(clonedReq);
    }

    this.spinnerService.show();

    return next.handle(request).pipe(
      finalize(() => this.spinnerService.hide())
    );
  }
}
