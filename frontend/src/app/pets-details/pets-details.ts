import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularMaterialModule } from '../ang-material.module';
import { LockerService } from '../shared/services/locker.service';

@Component({
  selector: 'app-pets-details',
  imports: [AngularMaterialModule],
  templateUrl: './pets-details.html',
  styleUrl: './pets-details.css'
})
export class PetsDetails {
  @Input() pet: any;
  @Output() petDeleted = new EventEmitter<void>();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lockerService: LockerService
  ) {}

  async deletePet() {

    try {
      // Load existing pet list
      const fileStr = await this.lockerService.downloadEncryptedFile('pet_list');
      const existingData = fileStr ? JSON.parse(fileStr) : { pets: [] };

      // Remove the pet by id
      existingData.pets = existingData.pets.filter((p: any) => p.id !== this.pet.id);

      // Update locker file
      await this.lockerService.deleteFile('pet_list');
      await this.lockerService.uploadEncryptedFile('pet_list', JSON.stringify(existingData));
      this.petDeleted.emit();
    } catch (err) {
      console.error('Error deleting pet', err);
    }
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.pet.image = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
