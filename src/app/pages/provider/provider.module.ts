import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProviderRoutingModule } from './provider-routing.module';
import { ProviderPageComponent } from './dashboard/provider-page.component';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ProviderProfileComponent } from './profile/provider-profile.component';
import { ProviderOpportunitiesComponent } from './opportunities/provider-opportunities.component';

@NgModule({
  declarations: [ProviderPageComponent, ProviderProfileComponent, ProviderOpportunitiesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ProviderRoutingModule,
    DialogModule,
    TagModule
  ]
})
export class ProviderModule { }
