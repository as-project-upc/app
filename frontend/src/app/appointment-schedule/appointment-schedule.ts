import { Component } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';

@Component({
  selector: 'app-appointment-schedule',
  imports: [AngularMaterialModule],
  templateUrl: './appointment-schedule.html',
  styleUrl: './appointment-schedule.css'
})
export class AppointmentSchedule {
  pets = [
    { id: 1, name: 'Milo' },
    { id: 2, name: 'Luna' }
  ];

  doctors = [
    { id: 1, name: 'Smith' },
    { id: 2, name: 'John' }
  ];

  data = {
    petId: 1,
    doctorId: 1,
    date: '',
    reason: ''
  };

  schedule() {
    console.log("Appointment Scheduled:", this.data);
    alert("Appointment successfully scheduled!");
  }
}
