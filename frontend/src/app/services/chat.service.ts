import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ReceiveMessage {
  fromUserId: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private ws!: WebSocket;
  private token = localStorage.getItem('authToken');

  private messageSubject = new Subject<ReceiveMessage>();
  public messages$ = this.messageSubject.asObservable();

  private onlineUsers = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsers.asObservable();

  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private messageQueue: any[] = [];

  constructor() {}

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(environment.wsBaseUrl);

      this.ws.onopen = () => {
        console.log('WS connected');
        this.connectionStatusSubject.next(true);

        this.sendPayload({ action: 'SubscribeUser' });
        this.sendPayload({ action: 'GetOnlineUsers' });
        resolve();
      };

      this.ws.onmessage = event => {
        const payload = JSON.parse(event.data);

        if (payload.action === 'ReceiveMessage') {
          const data = payload.data;

          this.messageSubject.next({
            fromUserId: data.fromUserId,
            message: data.message,
            timestamp: new Date(data.timestamp ?? Date.now()),
          });
        }

        if (payload.action === 'GetOnlineUsers') {
          console.log('Online users:', payload.data);
          this.onlineUsers.next(payload.data.users);
        }
      };

      this.ws.onerror = err => {
        console.error('WS error', err);
        this.connectionStatusSubject.next(false);
      };

      this.ws.onclose = () => {
        console.log('WS closed');
        this.connectionStatusSubject.next(false);
      };
    });
  }

  private sendPayload(payload: any) {
    const data = { ...payload, token: this.token };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.messageQueue.push(data);
    }
  }

  sendMessage(toUserId: string, message: string) {
    this.sendPayload({
      action: 'SendMessage',
      data: { toUserId, message },
    });
  }

  close() {
    this.ws.close();
  }
}
