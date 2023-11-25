import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', redirectTo: '/welcome', pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'main',
    children: [
      {
        path: '',
        redirectTo: '/main/statements',
        pathMatch: 'full'
      },
      {
        path: 'statements',
        loadComponent: () => import('./pages/main/statements/statements.page').then( m => m.StatementsPage)
      },
      {
        path: 'add-expense',
        loadComponent: () => import('./pages/main/add-expense/add-expense.page').then( m => m.AddExpensePage)
      },
      {
        path: 'details',
        loadComponent: () => import('./pages/main/details/details.page').then( m => m.DetailsPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/main/settings/settings.page').then( m => m.SettingsPage)
      },
    ]
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage)
  },
  {
    path: '**', redirectTo: '/welcome',
  },
  
];
