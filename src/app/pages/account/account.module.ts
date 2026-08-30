import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';
import { AccountPageComponent } from './account-page.component';

@NgModule({
  declarations: [AccountPageComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AccountRoutingModule],
})
export class AccountModule {}
