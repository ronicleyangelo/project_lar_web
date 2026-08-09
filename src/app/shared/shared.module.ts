import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { HeaderComponent } from './components/header/header.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { ProviderCardComponent } from './components/provider-card/provider-card.component';
import { ScoreBreakdownDialogComponent } from './components/score-breakdown-dialog/score-breakdown-dialog.component';
import { RatingDialogComponent } from './components/rating-dialog/rating-dialog.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { AuthBackgroundComponent } from './components/auth-background/auth-background.component';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    MobileNavComponent,
    ProviderCardComponent,
    ScoreBreakdownDialogComponent,
    RatingDialogComponent,
    EmptyStateComponent,
    AuthBackgroundComponent,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RatingModule,
    DialogModule,
    ButtonModule,
    TableModule,
    TagModule,
    CardModule,
    InputTextModule,
    DropdownModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RatingModule,
    DialogModule,
    ButtonModule,
    TableModule,
    TagModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    HeaderComponent,
    MobileNavComponent,
    ProviderCardComponent,
    ScoreBreakdownDialogComponent,
    RatingDialogComponent,
    EmptyStateComponent,
    AuthBackgroundComponent,
    TruncatePipe
  ]
})
export class SharedModule { }
