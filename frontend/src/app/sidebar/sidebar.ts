import { Component } from '@angular/core';
import { Home } from '../home/home';
import { AngularMaterialModule } from '../ang-material.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [AngularMaterialModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

}
