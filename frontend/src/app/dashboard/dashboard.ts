import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';
import { Router, RouterModule } from '@angular/router';
import { ModalDialog } from '../modal-dialog/modal-dialog';
import { MatDialog } from '@angular/material/dialog';
import { LockerService } from '../shared/services/locker.service';
import { OpaqueService } from '../services/opaque.service';
import { AppointmentService } from '../services/appointments.service';

@Component({
  selector: 'app-dashboard',
  imports: [AngularMaterialModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  selectedRequestType: string = '';

  constructor(
    private dialog: MatDialog,
    private lockerService: LockerService,
    private appointmentService: AppointmentService,
    private authService: OpaqueService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) { }
  reminders: any = [];
  appointments: any = [];
  doctors: any = [];
  pets: any = [];
  lockerData: any;
  role: any;

  ngOnInit() {
    this.role = this.authService.role;
    this.getAllPets();
    this.getAllDoctors();
    this.getAllAppointments();
    this.getAllReminders();
  }

  visiblePets = 0;
  maxVisible = 3;

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
      }
    } catch (err) {
      console.error('Error fetching reminders from locker', err);
      this.reminders = [];
    }
  }

  async getAllPets() {
    try {
      const res = await this.lockerService.downloadEncryptedFile('pet_list');

      if (res) {
        this.lockerData = JSON.parse(res);

        this.zone.run(() => {
          this.pets = this.lockerData.pets.map((p: any) => ({
            id: p.id,
            name: p.name,
            breed: p.breed,
            nextAppt: p.nextAppt || 'No appointments',
            imageLockerId: p.image?.lockerId || null,
          }));
          this.loadAllPetImages();
          this.cd.detectChanges();
        });

      }
    } catch (err) {
      console.error('Error fetching pets from locker', err);
      this.pets = [];
    }
  }

  async loadAllPetImages() {
    for (let pet of this.pets) {
      if (!pet.imageLockerId) {
        pet.imageUrl = null;
        continue;
      }

      try {
        const blob = await this.lockerService.downloadEncryptedBlob(pet.imageLockerId);
        // Now it's valid
        pet.imageUrl = URL.createObjectURL(blob);

      } catch (err) {
        console.error("Failed to load image for", pet.name, err);
        pet.imageUrl = null;
      }
    }

    this.cd.detectChanges();
  }



  onAddPet() {
    this.selectedRequestType = 'Add Pet';

    const dialogRef = this.dialog.open(ModalDialog, {
      panelClass: 'custom-dialog-panel',
      data: { mode: this.selectedRequestType },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.saved || result?.refresh) {
        this.getAllPets(); // Refresh pet list after add
      }
    });
  }

  getPetDetails(petId: number) {
    this.selectedRequestType = 'Pet Details';

    const selectedPet = this.pets.find((p: any) => p.id === petId);
    if (!selectedPet) {
      console.error('Pet not found with ID:', petId);
      return;
    }

    const dialogRef = this.dialog.open(ModalDialog, {
      panelClass: 'custom-dialog-panel',
      data: { mode: this.selectedRequestType, pet: selectedPet },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.refresh) {
        this.getAllPets(); // Refresh pet list after delete
      }
    });
  }
}
