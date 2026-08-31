import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { CompleteGoogleRegistrationComponent } from './complete-google-registration/complete-google-registration.component';
import { GuestHomeGuard } from '../../core/guards/guest-home.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, canActivate: [GuestHomeGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [GuestHomeGuard] },
      { path: 'complete-google', component: CompleteGoogleRegistrationComponent },
      { path: 'completar-google', redirectTo: 'complete-google', pathMatch: 'full' },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
