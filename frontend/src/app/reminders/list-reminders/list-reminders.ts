import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CreateReminders } from '../create-reminders/create-reminders';
import { AngularMaterialModule } from '../../ang-material.module';
import { LockerService } from '../../shared/services/locker.service';

@Component({
  selector: 'app-list-reminders',
  imports: [CreateReminders, AngularMaterialModule],
  templateUrl: './list-reminders.html',
  styleUrl: './list-reminders.css',
})
export class ListReminders {
  reminders: any = [];
  lockerData: any;

  constructor(
    private lockerService: LockerService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  showPanel = false;

  ngOnInit() {
    this.getAllReminders();
  }

  handleSave(reminder: any) {
    this.reminders.push(reminder);
    this.showPanel = false;
  }

  async getAllReminders() {
    try {
      const res = await this.lockerService.downloadEncryptedFile('reminder_list');

      if (res) {
        this.lockerData = JSON.parse(res);

        this.zone.run(() => {
          this.reminders = this.lockerData.reminders.map((a: any) => ({
            id: a.id,
            date: a.date,
            title: a.title,
            description: a.description,
          }));

          this.cd.detectChanges();
        });

        console.log('Loaded reminders:', this.reminders);
      }
    } catch (err) {
      console.error('Error fetching reminders from locker', err);
      this.reminders = [];
    }
  }

  deleteReminder(reminderId: string) {
    // const confirmed = this.confirmDialog.confirm(
    //   'Are you sure you want to delete this Reminder?',
    //   'Delete Reminder'
    // );

    // if (!confirmed) return;
    this.reminders = this.reminders.filter((a: any) => a.id !== reminderId);
    // Optional: If you store reminders in locker, also update locker
    this.saveRemindersToLocker();
  }

  async saveRemindersToLocker() {
    try {
      const data = { reminders: this.reminders };

      await this.lockerService.deleteFile('reminder_list');

      // Upload updated reminders
      await this.lockerService.uploadEncryptedFile(
        'reminder_list',
        JSON.stringify(data)
      );

    } catch (err) {
      console.error('Error saving reminders', err);
    }
  }
}
