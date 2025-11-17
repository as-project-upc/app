import { Component, Input } from '@angular/core';
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
  @Input() pet: any


  selectedImage: any;
  petForm: any;

  constructor(private route: ActivatedRoute, private router: Router, private lockerService: LockerService) {
  }


  savePet() {
    console.log("Pet saved:", this.pet);
    alert("Pet details updated!");
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

    onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.petForm.patchValue({ image: file.name });  // optional
    }
  }

}
