import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { DriverComponent } from './driver/driver.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'driver', component: DriverComponent },
  { path: '**', redirectTo: '' } // مسار افتراضي للأخطاء
];