import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  profileDropdown: boolean = false;

  constructor(private router: Router) {}

  logout() {
    console.log('Logging out user...');
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  toggleDropdown(){
    this.profileDropdown = true;
  }
}
