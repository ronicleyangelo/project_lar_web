import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { CompleteGoogleRegistrationComponent } from './complete-google-registration/complete-google-registration.component';

@NgModule({
  declarations: [AuthLayoutComponent, LoginComponent, RegisterComponent, CompleteGoogleRegistrationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
