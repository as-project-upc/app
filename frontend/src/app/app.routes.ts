import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { RoleGuard } from './guards/role.guard';
import { ListAppointments } from './appointments/list-appointments/list-appointments';
import { ListReminders } from './reminders/list-reminders/list-reminders';
import { Doctors } from './doctors/doctors';
import { Chat } from './chat/chat';
import { RoleSelection } from './role-selection/role-selection';


export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: Home },
  { path: 'role', component: RoleSelection },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Protected routes
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'doctors', component: Doctors },
      { path: 'chat', component: Chat },
      { path: 'reminders', component: ListReminders },
      { path: 'appointments', component: ListAppointments },

    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
