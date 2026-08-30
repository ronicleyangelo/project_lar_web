import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestHomeGuard } from './core/guards/guest-home.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    canActivate: [GuestHomeGuard],
    pathMatch: 'full'
  },
  {
    path: 'explore',
    loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'CLIENT' }
  },
  {
    path: 'client',
    loadChildren: () => import('./pages/client/client.module').then(m => m.ClientModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'CLIENT' }
  },
  {
    path: 'provider',
    loadChildren: () => import('./pages/provider/provider.module').then(m => m.ProviderModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROVIDER' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
