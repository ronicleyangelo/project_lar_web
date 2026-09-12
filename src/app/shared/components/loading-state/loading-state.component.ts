import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, ProgressSpinner],
  template: `
    <div class="loading-state-wrapper" *ngIf="loading">
      <p-progressSpinner
        strokeWidth="8"
        animationDuration=".5s"
        [style]="{'width': size, 'height': size}">
      </p-progressSpinner>
      <span class="loading-label" *ngIf="label">{{ label }}</span>
    </div>
    <ng-content *ngIf="!loading"></ng-content>
  `,
  styles: [`
    .loading-state-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 12px;
      width: 100%;
      min-height: 160px;
    }
    .loading-label {
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
    }
  `]
})
export class LoadingStateComponent {
  @Input() loading = false;
  @Input() label = 'Carregando...';
  @Input() size = '56px';
}
