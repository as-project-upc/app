import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularMaterialModule } from '../../ang-material.module';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LockerService } from '../../shared/services/locker.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-reminders',
  imports: [AngularMaterialModule],
  templateUrl: './create-reminders.html',
  styleUrl: './create-reminders.css'
})
export class CreateReminders {
  @Input() openPanel: boolean = false;
  @Output() panelClosed = new EventEmitter<void>();
  @Output() reminderSaved = new EventEmitter<any>();

  reminderForm!: FormGroup;

  constructor(private fb: FormBuilder, private lockerService: LockerService) { }

  ngOnInit() {
    this.reminderForm = this.fb.group({
      pet: [''],
      date: [''],
      description: ['']
    });
  }



  closePanel() {
    this.panelClosed.emit();
  }

  async saveReminder() {
  if (this.reminderForm.invalid) return;

  let existingData: any;

  // Load existing reminders from locker
  try {
    const fileStr = await this.lockerService.downloadEncryptedFile('reminder_list');
    existingData = fileStr ? JSON.parse(fileStr) : {};
  } catch {
    existingData = {};
  }

  existingData.reminders ??= [];

  const reminderCount = existingData.reminders.length;

  const formData = this.reminderForm.value;

  const reminderJson = {
    id: uuidv4(),
    date: formData.date,
    pet: formData.pet,
    description: formData.description || ''
  };

  // Delete old file before saving new
  if (existingData.reminders.length >= 0) {
    await this.lockerService.deleteFile('reminder_list');
  }

  existingData.reminders.push(reminderJson);

  await this.lockerService.uploadEncryptedFile(
    'reminder_list',
    JSON.stringify(existingData)
  );

  this.reminderSaved.emit(reminderJson);
  this.reminderForm.reset();
  this.closePanel();
}

}
