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
import { NgxEchartsModule } from 'ngx-echarts';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';


import { HeaderComponent } from './components/header/header.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { ProviderCardComponent } from './components/provider-card/provider-card.component';
import { ScoreGaugeComponent } from './components/score-gauge/score-gauge.component';
import { RatingDialogComponent } from './components/rating-dialog/rating-dialog.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { AuthBackgroundComponent } from './components/auth-background/auth-background.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { ActivityLabelPipe } from './pipes/activity-label.pipe';
import { PageHeroComponent } from './components/page-hero/page-hero.component';

@NgModule({
  declarations: [
    HeaderComponent,
    MobileNavComponent,
    ProviderCardComponent,
    ScoreGaugeComponent,
    RatingDialogComponent,
    EmptyStateComponent,
    AuthBackgroundComponent,
    TruncatePipe,
    ActivityLabelPipe,
    PageHeroComponent
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
    DropdownModule,
    TranslatePipe,
    TranslateDirective,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
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
    NgxEchartsModule,
    TranslatePipe,
    TranslateDirective,
    HeaderComponent,
    MobileNavComponent,
    ProviderCardComponent,
    ScoreGaugeComponent,
    RatingDialogComponent,
    EmptyStateComponent,
    AuthBackgroundComponent,
    TruncatePipe,
    ActivityLabelPipe,
    PageHeroComponent
  ]
})
export class SharedModule { }
