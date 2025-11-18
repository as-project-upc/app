import { Component, EventEmitter, Output } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LockerService } from '../shared/services/locker.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalDialog } from '../modal-dialog/modal-dialog';
import { v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-pets-add',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './pets-add.html',
  styleUrls: ['./pets-add.css']
})
export class PetsAdd {
  petForm!: FormGroup;
  @Output() petAdded = new EventEmitter<void>();

  speciesList = [
    'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog',
    'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer',
    'Dachshund', 'Husky', 'Doberman', 'Shih Tzu', 'Pomeranian', 'Chihuahua'
  ];
  imagePreview?: string;
  selectedFile?: File;

  constructor(
    private fb: FormBuilder,
    private lockerService: LockerService,
    private dialogRef: MatDialogRef<ModalDialog>
  ) { }

  ngOnInit(): void {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      breed: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      notes: [''],
      image: [null]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }


  async savePet() {
    if (this.petForm.invalid) return;

    let existingPets: any;

    try {
      const fileStr = await this.lockerService.downloadEncryptedFile('pet_list');
      existingPets = fileStr ? JSON.parse(fileStr) : {};
    } catch {
      existingPets = {};
    }

    existingPets.pets ??= [];

    const petCount = existingPets.pets.length;

    let imageLockerId = '';
    if (this.selectedFile) {
      const lockerId = this.petForm.get('name')?.value
      await this.lockerService.uploadFile(this.selectedFile, lockerId);
      imageLockerId = lockerId;
    }

    const petData = this.petForm.value;

    const petJson = {
      id: uuidv4(),
      name: petData.name,
      breed: petData.breed,
      age: petData.age,
      notes: petData.notes,
      image: imageLockerId
        ? {
          filename: this.selectedFile?.name,
          lockerId: imageLockerId,
          uploadedAt: new Date().toISOString()
        }
        : null,
      nextAppt: '',
      reminders: [],
      appointments: []
    };

    if (existingPets.pets.length >= 0) {
      await this.lockerService.deleteFile('pet_list');
    }

    existingPets.pets.push(petJson);

    await this.lockerService.uploadEncryptedFile(
      'pet_list',
      JSON.stringify(existingPets)
    );
    this.petAdded.emit();
    this.dialogRef.close({ saved: true });
  }


}
