import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ClientRoutingModule } from './client-routing.module';
import { ClientPageComponent } from './client-page.component';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [ClientPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ClientRoutingModule,
    DialogModule,
    TagModule
  ]
})
export class ClientModule { }