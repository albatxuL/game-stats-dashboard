import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/global-overview/global-overview.component')
        .then(m => m.GlobalOverviewComponent)
  },
  {
    path: 'player/:id',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'methodology',
    loadComponent: () =>
      import('./features/methodology/methodology.component')
        .then(m => m.MethodologyComponent)
  },
  { path: '**', redirectTo: '' }
];