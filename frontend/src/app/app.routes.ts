import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'budgets',
        loadComponent: () => import('./components/budgets/budgets.component').then(m => m.BudgetsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
