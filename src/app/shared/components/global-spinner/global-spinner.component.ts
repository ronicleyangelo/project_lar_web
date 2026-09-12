import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { GlobalSpinnerService } from '../../../core/services/global-spinner.service';

@Component({
  selector: 'app-global-spinner',
  templateUrl: './global-spinner.component.html',
  styleUrls: ['./global-spinner.component.css'],
  standalone: true,
  imports: [CommonModule, ProgressSpinner]
})
export class GlobalSpinnerComponent {
  constructor(public spinnerService: GlobalSpinnerService) {}
}
