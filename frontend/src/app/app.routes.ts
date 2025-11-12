import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';


export const routes: Routes = [
  // Public route
  { path: 'login', component: LoginComponent  },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: Home },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Protected routes inside layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
