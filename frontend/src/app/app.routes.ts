import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'principles',
    canActivate: [authGuard],
    loadComponent: () => import('./features/principles/principles.component').then(m => m.PrinciplesComponent),
  },
  {
    path: 'principles/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/principles/principle-detail/principle-detail.component').then(m => m.PrincipleDetailComponent),
  },
  { path: '**', redirectTo: '/dashboard' },
];
