import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularMaterialModule } from '../../ang-material.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointments.service';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './create-appointment.html',
  styleUrls: ['./create-appointment.css']
})
export class CreateAppointment {
  @Input() openPanel: boolean = false;
  @Output() panelClosed = new EventEmitter<void>();
  appointmentForm!: FormGroup;
  doctors: any;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.getAllDoctors();
    this.appointmentForm = this.fb.group({
      doctor_id: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  closePanel() {
    this.panelClosed.emit();
  }


  getAllDoctors() {
    this.appointmentService.listDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      },
    });
  }

  saveAppointment() {
    if (this.appointmentForm.invalid) return;

    const { doctor_id, date, time } = this.appointmentForm.value;

    const datetime = new Date(`${date}T${time}`).toISOString();

    this.appointmentService.addAppointment(doctor_id, datetime).subscribe({
      next: (data) => {
        console.log('Appointment Created');
        this.closePanel();
        this.appointmentForm.reset();
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }
}
