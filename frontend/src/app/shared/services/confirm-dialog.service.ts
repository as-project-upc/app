import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) {}

  confirm(
    message: string,
    title?: string,
    width: string = '350px'
  ): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width,
      data: { message, title }
    });

    return dialogRef.afterClosed().toPromise() as Promise<boolean>;
  }
}
