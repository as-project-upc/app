import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationSubject = new Subject<AppNotification>();
  public notifications$ = this.notificationSubject.asObservable();

  showSuccess(title: string, message: string) {
    this.notificationSubject.next({ type: 'success', title, message });
  }

  showError(title: string, message: string) {
    this.notificationSubject.next({ type: 'error', title, message });
  }
}
