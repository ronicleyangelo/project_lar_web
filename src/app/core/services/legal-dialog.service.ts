import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type LegalDialogKind = 'about' | 'privacy' | 'terms';

@Injectable({ providedIn: 'root' })
export class LegalDialogService {
  private readonly dialogSubject = new BehaviorSubject<LegalDialogKind | null>(null);
  readonly dialog$ = this.dialogSubject.asObservable();

  open(kind: LegalDialogKind): void { this.dialogSubject.next(kind); }
  close(): void { this.dialogSubject.next(null); }
}

