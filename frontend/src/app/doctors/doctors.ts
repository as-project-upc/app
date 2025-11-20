import { Component } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';
import { AppointmentService } from '../services/appointments.service';

@Component({
  selector: 'app-doctors',
  imports: [AngularMaterialModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors {
  doctors: any;

  constructor(
    private appointmentService: AppointmentService
  ) { }

  ngOnInit() {
    this.getAllDoctors();
  }

  getAllDoctors() {
    this.appointmentService.listDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
      },
    });
  }

}
