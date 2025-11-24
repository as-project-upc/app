import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private ws: WebSocket;

  constructor() {
    this.ws = new WebSocket(environment.wsBaseUrl);
  }
}
