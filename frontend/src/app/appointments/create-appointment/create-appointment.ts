import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularMaterialModule } from '../../ang-material.module';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LockerService } from '../../shared/services/locker.service';
import { v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-create-appointment',
  imports: [AngularMaterialModule],
  templateUrl: './create-appointment.html',
  styleUrl: './create-appointment.css'
})
export class CreateAppointment {
  @Input() openPanel: boolean = false;
  @Output() panelClosed = new EventEmitter<void>();
  @Output() appointmentSaved = new EventEmitter<any>();

  appointmentForm!: FormGroup;

  constructor(private fb: FormBuilder, private lockerService: LockerService) { }

  ngOnInit() {
    this.appointmentForm = this.fb.group({
      pet: [''],
      date: [''],
      time: [''],
      virtual: [false],
      attachments: [''],
      status: ['confirmed']
    });
  }


  closePanel() {
    this.panelClosed.emit();
  }

  async saveAppointment() {
    if (this.appointmentForm.invalid) return;

    let existingData: any;

    // Load existing appointments from locker
    try {
      const fileStr = await this.lockerService.downloadEncryptedFile('appointment_list');
      existingData = fileStr ? JSON.parse(fileStr) : {};
    } catch {
      existingData = {};
    }

    existingData.appointments ??= [];

    const appointmentCount = existingData.appointments.length;

    const formData = this.appointmentForm.value;

    const appointmentJson = {
      id: uuidv4(),
      date: formData.date,
      time: formData.time,
      pet: formData.pet,
      virtual: formData.virtual || false,
      status: formData.status || 'pending',
      notes: formData.notes || ''
    };

    // Delete old file before saving new
    if (existingData.appointments.length >= 0) {
      await this.lockerService.deleteFile('appointment_list');
    }

    existingData.appointments.push(appointmentJson);

    await this.lockerService.uploadEncryptedFile(
      'appointment_list',
      JSON.stringify(existingData)
    );

    this.appointmentSaved.emit(this.appointmentForm.value);
    this.appointmentForm.reset({ status: 'confirmed', virtual: false });
    this.closePanel();

  }

}
