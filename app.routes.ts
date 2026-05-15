import { Routes } from '@angular/router';
import { managerGuard, driverGuard } from './auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [managerGuard]
  },
  { 
    path: 'kds', 
    loadComponent: () => import('./components/dashboard/kds/kds.component').then(m => m.KdsComponent),
    canActivate: [managerGuard]
  },
  { 
    path: 'driver', 
    loadComponent: () => import('./components/driver-dashboard/driver-dashboard.component').then(m => m.DriverDashboardComponent),
    canActivate: [driverGuard]
  },
  { 
    path: 'invoice/:id', 
    loadComponent: () => import('./components/invoice/invoice.component').then(m => m.InvoiceComponent)
  },
  {
    path: 'qr-order',
    loadComponent: () => import('./components/qr-order/qr-order.component').then(m => m.QrOrderComponent)
  },
  // Redirect any other path to the home page
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
