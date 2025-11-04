import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';


export const routes: Routes = [
  // Public route
  { path: 'login', component: LoginComponent  },
  // { path: 'register', component: RegisterComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Protected routes inside layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
