import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPageComponent } from './admin-page.component';
import { TableModule } from 'primeng/table';
import { AdminProviderDetailComponent } from './admin-provider-detail.component';

@NgModule({
  declarations: [AdminPageComponent, AdminProviderDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AdminRoutingModule,
    TableModule
  ]
})
export class AdminModule { }
