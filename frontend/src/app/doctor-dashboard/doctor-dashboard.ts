import { Component } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';

@Component({
  selector: 'app-doctor-dashboard',
  imports: [AngularMaterialModule],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css'
})
export class DoctorDashboard {
todaysAppointments = [
  { time: '9:00 AM', owner: 'Sarah L', pet: 'Max', type: 'Checkup', status: 'Confirmed' },
  { time: '10:30 AM', owner: 'John D', pet: 'Coco', type: 'Vaccination', status: 'Pending' },
];

upcomingSchedule = [
  { date: '06/19/2021', slot: '5:00 PM', description: 'General Checkup' },
  { date: '06/20/2021', slot: '4:30 PM', description: 'Eye Exam' },
];

patients = [
  { owner: 'Sarah Lewis', pet: 'Max', breed: 'Beagle', image: 'assets/dog1.jpg', nextAppt: 'Tomorrow 9:00 AM' },
  { owner: 'John Doe', pet: 'Coco', breed: 'Poodle', image: 'assets/dog2.jpg', nextAppt: 'Today 4:30 PM' }
];

}
