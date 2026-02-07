import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Categories } from './pages/dashboard/categories/categories';
import { Currencies } from './pages/dashboard/currencies/currencies';
import { System } from './pages/dashboard/system/system';
import { Users } from './pages/dashboard/users/users';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: Users },
      { path: 'currencies', component: Currencies },
      { path: 'categories', component: Categories },
      { path: 'system', component: System },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
