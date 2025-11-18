import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CreateAppointment } from "../create-appointment/create-appointment";
import { AngularMaterialModule } from '../../ang-material.module';
import { LockerService } from '../../shared/services/locker.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-list-appointments',
  imports: [CreateAppointment, AngularMaterialModule],
  templateUrl: './list-appointments.html',
  styleUrl: './list-appointments.css'
})
export class ListAppointments {
  showPanel: boolean = false;
  lockerData: any;
  appointments: any = [];
  constructor(private lockerService: LockerService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private confirmDialog: ConfirmDialogService,
    private notify: NotificationService) { }

  ngOnInit() {
    this.getAllAppointments();
  }

  handleSave(appointment: any) {
    this.appointments.push(appointment);
    this.showPanel = false;
  }

  async getAllAppointments() {
    try {
      const res = await this.lockerService.downloadEncryptedFile('appointment_list');

      if (res) {
        this.lockerData = JSON.parse(res);

        this.zone.run(() => {
          this.appointments = this.lockerData.appointments.map((a: any) => ({
            id: a.id,
            date: a.date,
            time: a.time,
            pet: a.pet,
            virtual: a.virtual || false,
            status: a.status || 'pending'
          }));

          this.cd.detectChanges();
        });

        console.log('Loaded appointments:', this.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments from locker', err);
      this.appointments = [];
    }
  }

  deleteAppointment(appointmentId: string) {
    // const confirmed = this.confirmDialog.confirm(
    //   'Are you sure you want to delete this appointment?',
    //   'Delete Appointment'
    // );

    // if (!confirmed) return;
    this.appointments = this.appointments.filter((a: any) => a.id !== appointmentId);
    // Optional: If you store appointments in locker, also update locker
    this.saveAppointmentsToLocker();
  }

  async saveAppointmentsToLocker() {
    try {
      const data = { appointments: this.appointments };

      await this.lockerService.deleteFile('appointment_list');

      // Upload updated appointments
      await this.lockerService.uploadEncryptedFile(
        'appointment_list',
        JSON.stringify(data)
      );
      this.notify.showSuccess(
        "File uploaded",
        "Your encrypted file has been uploaded successfully."
      );
    } catch (err) {
      this.notify.showError(
        "Upload failed",
        "Could not upload your encrypted file."
      );
      console.error('Error saving appointments', err);
    }
  }


}
