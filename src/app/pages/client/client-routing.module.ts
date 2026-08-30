import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientPageComponent } from './client-page.component';
import { ClientProfileComponent } from './profile/client-profile.component';

const routes: Routes = [{ path: 'profile', component: ClientProfileComponent }, { path: '', component: ClientPageComponent, pathMatch: 'full' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
