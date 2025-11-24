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
  todaysAppointments: any = [];
  totalAppointments: any = [];
  selectedDate : any;
  doctors: any = [];
  pets: any = [];
  lockerData: any;
  role: any;
  username: any;
  currentOffset = 0;
  currentDate = new Date();
  currentMonth!: string;
  currentYear!: number;
  calendarDays: any[] = [];


  ngOnInit() {
    this.role = this.authService.role;
    this.username = this.authService.username;
    if (this.role == 'user') {
      this.getAllPets();
    }
    this.getAllDoctors();
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
    if (this.role === 'doctor') {
      const doc = this.doctors.find((d: any) => d.username === this.username);
      this.appointments = doc?.appointments || [];
    }
    else if (this.role == 'user') {
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
    this.generateCalendar();
    this.getTodaysAppointments()
    this.getTotalAppointments(new Date().getDate());
  }

  generateCalendar() {
    const date = this.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    this.currentYear = year;
    this.currentMonth = date.toLocaleString("default", { month: "long" });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: any[] = [];

    for (let i = 0; i < startIndex; i++) {
      days.push({ empty: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      const hasAppointment = this.appointments.some((a: any) =>
        a.date.slice(0, 10) === dateStr
      );

      days.push({
        date: d,
        hasAppointment
      });
    }

    this.calendarDays = days;
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    this.generateCalendar();
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

    this.generateCalendar();
  }

  getTodaysAppointments() {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    this.todaysAppointments = this.appointments.filter((a: any) =>
      a.date === today
    );
  }

  getTotalAppointments(dayNumber: number) {
    const year = this.currentYear
    const month = String(this.currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(dayNumber).padStart(2, "0");

    const selectedDate = `${year}-${month}-${day}`;
    this.selectedDate = selectedDate;

    this.totalAppointments = this.appointments.filter((a: any) =>
      a.date.slice(0, 10) === selectedDate
    ).length;

  }





  getAllDoctors() {
    this.appointmentService.listDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.getAllAppointments();
      },
      error: (err) => console.error('Error loading doctors:', err)
    });
  }

  getDoctorName(id: any) {
    const doc = this.doctors.find((d: any) => d.id === id);
    return doc ? 'Dr. ' + doc.name + ' ' + doc.surname : 'Unknown';
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
              title: a.title,
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
