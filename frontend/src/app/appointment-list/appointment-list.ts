import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-list',
  imports: [],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css'
})
export class AppointmentList {
  appointments = [
    { id: 1, petName: 'Milo', doctor: 'Smith', date: '2025-01-15 10:00', status: 'Upcoming' },
    { id: 2, petName: 'Luna', doctor: 'John', date: '2025-01-20 16:00', status: 'Upcoming' },
    { id: 3, petName: 'Oscar', doctor: 'Alex', date: '2024-12-10 09:00', status: 'Completed' }
  ];

  constructor(private router: Router) {}

  viewAppointment(id: number) {
    this.router.navigate(['/appointments', id]);
  }
}
