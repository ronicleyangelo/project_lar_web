import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { AdminProviderDetailComponent } from './admin-provider-detail.component';

const routes: Routes = [
  { path: '', component: AdminPageComponent },
  { path: 'providers/:id', component: AdminProviderDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
