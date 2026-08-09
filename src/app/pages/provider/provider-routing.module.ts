import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderPageComponent } from './provider-page.component';

const routes: Routes = [{ path: '', component: ProviderPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }