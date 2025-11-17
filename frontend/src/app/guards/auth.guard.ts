import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { OpaqueService } from '../auth/services/opaque.service';

interface JwtPayload {
  username: string,
  email: string,
  role: string,
  exp?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: OpaqueService) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');
    console.log('AuthGuard canActivate, authToken:', token);

    if (!token) {
      console.log('No token, redirecting to login...');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
        this.authService.setUser(decoded.username, decoded.email, decoded.role);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.log('Token expired, redirecting to login...');
        localStorage.removeItem('authToken');
        this.router.navigate(['/login']);
        return false;
      }

      return true;

    } catch (err) {
      console.error('Invalid token, redirecting to login...', err);
      localStorage.clear()
      this.router.navigate(['/login']);
      return false;
    }
  }
}
