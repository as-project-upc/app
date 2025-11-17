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
  reminders = [
    { date: '08/08/2020', pet: 'BALDWIN', description: 'Annual Physical Examination' },
    { date: '04/29/2020', pet: 'BALDWIN', description: 'Medical Progress Exam Eye Problem' },
    { date: '07/11/2020', pet: 'BALDWIN', description: 'Coughing or Respiratory Problem' },
    { date: '07/28/2020', pet: 'BALDWIN', description: 'Annual Physical Examination' }
  ];

  appointments = [
    {
      date: '06/16/2021',
      time: '5:15 PM',
      pet: 'BALDWIN',
      virtual: true,
      attachments: 'Manage',
      status: ''
    },
    {
      date: '06/21/2021',
      time: '4:30 PM',
      pet: 'Coconut',
      virtual: false,
      attachments: '',
      status: 'cancel'
    },
    {
      date: '06/23/2021',
      time: '11:45 AM',
      pet: 'Coconut',
      virtual: false,
      attachments: '',
      status: 'confirmed'
    }
  ];

  pets :any = [];
  lockerData: any;

  ngOnInit() {
    this.getAllPets();
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
      console.log(this.lockerData.pets)
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
