import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CreateAppointment } from "../create-appointment/create-appointment";
import { AngularMaterialModule } from '../../ang-material.module';
import { LockerService } from '../../shared/services/locker.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../shared/services/notification.service';
import { AppointmentService } from '../../services/appointments.service';

@Component({
  selector: 'app-list-appointments',
  imports: [CreateAppointment, AngularMaterialModule],
  templateUrl: './list-appointments.html',
  styleUrl: './list-appointments.css'
})
export class ListAppointments {
  showPanel = false;
  appointments: any = [];
  doctors: any = [];

  constructor(
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit() {
    this.getAllDoctors();        // MUST load doctors first
    this.getAllAppointments();
  }

  handleSave(appointment: any) {
    this.appointments.push(appointment);
    this.showPanel = false;
  }

  getAllAppointments() {
    this.appointmentService.listAppointments().subscribe({
      next: (data) => {
        this.appointments = data.map((a: any) => {
          const d = new Date(a.date);

          return {
            ...a,
            date: d.toLocaleDateString(),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });
      },
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  getAllDoctors() {
    this.appointmentService.listDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (err) => console.error('Error loading doctors:', err)
    });
  }

  getDoctorName(id: any) {
    const doc = this.doctors.find((d: any) => d.id === id);
    return doc ? doc.username : 'Unknown';
  }

  deleteAppointment(appointmentId: any) {
    this.appointmentService.deleteAppointment(appointmentId).subscribe({
      next: (data) => {
        if (data) {
          this.getAllAppointments();
        }
      },
      error: (err) => console.error('Error:', err)
    });
  }

  refreshPage(){
    this.getAllAppointments();
    this.showPanel = false;
  }
}
