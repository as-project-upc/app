import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from "../sidebar/sidebar";
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Dashboard, Sidebar],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  showFeedbackPanel = false;

  constructor(private dialog: MatDialog) {}

  toggleFeedbackPanel() {
    this.showFeedbackPanel = !this.showFeedbackPanel;
  }


}
