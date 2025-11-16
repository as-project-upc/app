import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { AppointmentDetails } from './appointment-details/appointment-details';
import { AppointmentSchedule } from './appointment-schedule/appointment-schedule';


export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: Home },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Protected routes
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },


      // Appointments
      { path: 'appointments/schedule', component: AppointmentSchedule },
      { path: 'appointments/details/:id', component: AppointmentDetails },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
