import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';
import { Router, RouterModule } from '@angular/router';
import { ModalDialog } from '../modal-dialog/modal-dialog';
import { MatDialog } from '@angular/material/dialog';
import { LockerService } from '../shared/services/locker.service';

@Component({
  selector: 'app-dashboard',
  imports: [AngularMaterialModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  selectedRequestType: string = '';
  constructor(private dialog: MatDialog,
    private lockerService: LockerService,
    private cd: ChangeDetectorRef,
    private zone: NgZone) { }
  reminders: any = [];
  appointments: any = [];
  pets: any = [];
  lockerData: any;

  ngOnInit() {
    this.getAllPets();
    this.getAllAppointments();
    this.getAllReminders();
  }

  visiblePets = 0; // current slide index
  maxVisible = 3;  // how many cards per view (adjustable)

  nextSlide() {
    if (this.visiblePets < this.pets.length - this.maxVisible) {
      this.visiblePets++;
    }
  }

  prevSlide() {
    if (this.visiblePets > 0) {
      this.visiblePets--;
    }
  }

  onAddPet() {
    this.selectedRequestType = "Add Pet";
    this.dialog.open(ModalDialog, {
      panelClass: 'custom-dialog-panel',
      data: {
        mode: this.selectedRequestType
      }
    });
  }

  async getAllAppointments() {
    try {
      const res = await this.lockerService.downloadEncryptedFile('appointment_list');

      if (res) {
        this.lockerData = JSON.parse(res);

        this.zone.run(() => {
          this.appointments = this.lockerData.appointments
            .map((a: any) => ({
              id: a.id,
              date: a.date,
              time: a.time,
              pet: a.pet,
              virtual: a.virtual || false,
              status: a.status || 'pending'
            }))
            // Sort newest first (by date and time)
            .sort((a: any, b: any) => {
              const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
              const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
              return dateB.getTime() - dateA.getTime();
            })
            // Take top 5
            .slice(0, 5);

          this.cd.detectChanges();
        });

        console.log('Top 5 newest appointments:', this.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments from locker', err);
      this.appointments = [];
    }
  }


  async getAllReminders() {
    try {
      const res = await this.lockerService.downloadEncryptedFile('reminder_list');

      if (res) {
        this.lockerData = JSON.parse(res);

        this.zone.run(() => {
          this.reminders = this.lockerData.reminders
            .map((a: any) => ({
              id: a.id,
              date: a.date,
              pet: a.pet,
              description: a.description,
            }))
            // Sort newest first by date
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            // Take top 5
            .slice(0, 5);

          this.cd.detectChanges();
        });

        console.log('Top 5 newest reminders:', this.reminders);
      }
    } catch (err) {
      console.error('Error fetching reminders from locker', err);
      this.reminders = [];
    }
  }


  async getAllPets() {
    try {
      const res = await this.lockerService.downloadEncryptedFile('pet_list');
      const r = await this.lockerService.downloadFile('pet0');
      if (res) {
        this.lockerData = JSON.parse(res);
        this.zone.run(() => {
          this.pets = this.lockerData.pets.map((p: any) => ({
            id: p.id,
            name: p.name,
            breed: p.breed,
            nextAppt: p.nextAppt || 'No appointments',
            image: p.image
              ? false
              : '../../assets/images/dog.jpg',
          }));
          this.cd.detectChanges();
        });
      }
    } catch (err) {
      console.error('Error fetching pets from locker', err);
      this.pets = [];
    }
  }

  getPetDetails(petId: number) {
    this.selectedRequestType = "Pet Details";

    const selectedPet = this.lockerData.pets.find((p: any) => p.id === petId);
    if (!selectedPet) {
      console.error('Pet not found with ID:', petId);
      return;
    }

    this.dialog.open(ModalDialog, {
      panelClass: 'custom-dialog-panel',
      data: {
        mode: this.selectedRequestType,
        pet: selectedPet
      }
    });
  }

}
