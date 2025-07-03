import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
  },
  {
    path: 'details/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/details/details.page').then(m => m.DetailsPage)
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/tabs/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tabs/tasks/tasks.page').then(m => m.TasksPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/tabs/settings/settings.page').then(m => m.SettingsPage),
      },
      {
        path: 'asks',
        loadComponent: () => import('./pages/tabs/asks/asks.page').then(m => m.AsksPage),
      },
      {
        path: 'welcome',
        loadComponent: () => import('./pages/tabs/welcome/welcome.page').then(m => m.WelcomePage),
      },
    ],
  },
];
