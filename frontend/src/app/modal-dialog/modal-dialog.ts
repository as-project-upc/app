import { Component, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from '../ang-material.module';
import { PetsAdd } from "../pets-add/pets-add";
import { PetsDetails } from "../pets-details/pets-details";

@Component({
  selector: 'app-modal-dialog',
  imports: [AngularMaterialModule, PetsAdd, PetsDetails],
  templateUrl: './modal-dialog.html',
  styleUrl: './modal-dialog.css'
})
export class ModalDialog {
@Input() title: any;
  @Input() tab: any;
  @Input() mode: any;
  @Input() modalData: any;
  @Output() showModal: any;

  constructor(private dialogRef: MatDialogRef<ModalDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string, tab: string, modalData: any }
  ) {
    this.tab = data.tab;
    this.modalData = data.modalData;
  }

  ngOnInit(){
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
