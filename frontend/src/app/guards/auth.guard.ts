import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');
    console.log('AuthGuard canActivate, authToken:', token);
    if (token) return true;
    console.log('Redirecting to login...');
    this.router.navigate(['/login']);
    return false;
  }

}
