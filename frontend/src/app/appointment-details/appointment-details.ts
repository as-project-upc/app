import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularMaterialModule } from '../ang-material.module';

@Component({
  selector: 'app-appointment-details',
  imports: [AngularMaterialModule],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css'
})
export class AppointmentDetails {
  appointmentId!: number;

  appointment: any = {
    id: 1,
    petName: 'Milo',
    doctor: 'Smith',
    date: '2025-01-15 10:00',
    status: 'Upcoming'
  };

  constructor(private route: ActivatedRoute) {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));
  }
}
