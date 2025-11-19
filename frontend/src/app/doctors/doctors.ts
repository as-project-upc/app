import { Component } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';

@Component({
  selector: 'app-doctors',
  imports: [AngularMaterialModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors {
doctors = [
  {
    "id": 1,
    "name": "Dr. Alice Johnson",
    "specialty": "Cardiologist",
    "nextAppointment": "2025-11-22 10:00 AM",
    "image": "../../assets/images/doctor1.jpg"
  },
  {
    "id": 2,
    "name": "Dr. Michael Smith",
    "specialty": "Dermatologist",
    "nextAppointment": "2025-11-23 02:00 PM",
    "image": "../../assets/images/doctor2.jpg"
  },
  {
    "id": 3,
    "name": "Dr. Emily Davis",
    "specialty": "Pediatrician",
    "nextAppointment": "2025-11-24 11:30 AM",
    "image": "../../assets/images/doctor3.jpg"
  },
  {
    "id": 4,
    "name": "Dr. Robert Lee",
    "specialty": "Orthopedic Surgeon",
    "nextAppointment": "2025-11-25 09:00 AM",
    "image": "../../assets/images/doctor4.jpg"
  },
  {
    "id": 5,
    "name": "Dr. Sarah Wilson",
    "specialty": "Neurologist",
    "nextAppointment": "2025-11-26 03:15 PM",
    "image": "../../assets/images/doctor5.jpg"
  }
]

}
