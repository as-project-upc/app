import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { Sidebar } from "../sidebar/sidebar";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DashboardComponent, Sidebar],
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
