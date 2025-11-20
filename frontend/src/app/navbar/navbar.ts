import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OpaqueService } from '../services/opaque.service';
import { AngularMaterialModule } from '../ang-material.module';

@Component({
  selector: 'app-navbar',
  imports: [AngularMaterialModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  profileDropdown: boolean = false;
  username: any;
  email :any;
  role :any;
  constructor(private router: Router, private authService: OpaqueService) {}


  ngOnInit(){
    this.username = this.authService.username
    this.email = this.authService.email
    this.role = this.authService.role
  }

  logout() {
    console.log('Logging out user...');
    localStorage.clear()
    this.router.navigate(['/login']);
  }

  toggleDropdown(){
    this.profileDropdown = true;
  }

  goToDashboard(){
    this.router.navigate(['/dashboard'])
  }


}
