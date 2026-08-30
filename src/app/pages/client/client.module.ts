import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientProfileComponent } from './profile/client-profile.component';
import { SharedModule } from '../../shared/shared.module';
import { ClientRoutingModule } from './client-routing.module';
import { ClientPageComponent } from './client-page.component';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [ClientPageComponent, ClientProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ClientRoutingModule,
    DialogModule,
    TagModule
  ]
})
export class ClientModule { }
