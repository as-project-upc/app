import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { DoctorDashboard } from './doctor-dashboard/doctor-dashboard';
import { RoleGuard } from './guards/role.guard';
import { ListAppointments } from './appointments/list-appointments/list-appointments';
import { ListReminders } from './reminders/list-reminders/list-reminders';


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
      { path: 'reminders', component: ListReminders },
      { path: 'appointments', component: ListAppointments },
      { path: 'doctor-dashboard', component: DoctorDashboard, canActivate: [RoleGuard]}

    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
