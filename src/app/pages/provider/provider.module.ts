import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProviderRoutingModule } from './provider-routing.module';
import { ProviderPageComponent } from './provider-page.component';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [ProviderPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ProviderRoutingModule,
    DialogModule,
    TagModule
  ]
})
export class ProviderModule { }