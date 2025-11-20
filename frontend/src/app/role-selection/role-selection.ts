import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  imports: [],
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.css'
})
export class RoleSelection {
  roleSelected: any = '';

  constructor(private router: Router){}

  selectRole(role: string) {
    this.roleSelected = role;
    this.router.navigate(['/register'], {
      queryParams: { role: role }
    });
  }
}
