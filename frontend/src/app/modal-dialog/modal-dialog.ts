import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from '../ang-material.module';
import { PetsAdd } from '../pets/pets-add/pets-add';
import { PetsDetails } from '../pets/pets-details/pets-details';

@Component({
  selector: 'app-modal-dialog',
  imports: [AngularMaterialModule, PetsAdd, PetsDetails],
  templateUrl: './modal-dialog.html',
  styleUrl: './modal-dialog.css'
})
export class ModalDialog {
  pet: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalDialog>
  ) {
    this.pet = data.pet;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  handlePetDeleted() {
    this.dialogRef.close({ refresh: true });
  }

  handlePetAdded() {
    this.dialogRef.close({ refresh: true });
  }
}
