import { Routes } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '', redirectTo: '/welcome', pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage),
    canActivate: [authGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage),
    canActivate: [authGuard],
    providers: [AuthService]
  },
  {
    path: 'main',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/main/add-expense',
        pathMatch: 'full'
      },
      // {
      //   path: 'statements',
      //   loadComponent: () => import('./pages/main/statements/statements.page').then( m => m.StatementsPage)
      // },
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
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage),
    canActivate: [authGuard],
  },
  {
    path: '**', redirectTo: '/welcome',
  },
  
];
