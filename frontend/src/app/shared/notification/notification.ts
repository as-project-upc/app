import { Component } from '@angular/core';
import { AppNotification, NotificationService } from '../services/notification.service';
import { AngularMaterialModule } from '../../ang-material.module';

@Component({
  selector: 'app-notification',
  imports: [AngularMaterialModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification {

  current?: AppNotification;
  visible = false;

  constructor(private ns: NotificationService) {}

  ngOnInit() {
    this.ns.notifications$.subscribe(n => {
      this.current = n;
      this.visible = true;

      setTimeout(() => this.visible = false, 3000);
    });
  }

  close() {
    this.visible = false;
  }
}
