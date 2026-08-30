import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderPageComponent } from './dashboard/provider-page.component';
import { ProviderProfileComponent } from './profile/provider-profile.component';
import { ProviderOpportunitiesComponent } from './opportunities/provider-opportunities.component';

const routes: Routes = [
  { path: 'profile', component: ProviderProfileComponent },
  { path: 'opportunities', component: ProviderOpportunitiesComponent },
  { path: '', component: ProviderPageComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
