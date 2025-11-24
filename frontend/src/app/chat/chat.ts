import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ChatService, ReceiveMessage } from '../services/chat.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AngularMaterialModule } from "../ang-material.module";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat implements OnInit, OnDestroy {
  selectedUser: { id: string, name: string } | null = null;
  messages: { text: string, fromMe: boolean, time: string }[] = [];
  messageText = '';
  isOnline = false;

  private subs: Subscription[] = [];
  @ViewChild('msgContainer') msgContainer!: ElementRef;

  constructor(private chatService: ChatService, private route: ActivatedRoute) { }

  async ngOnInit() {
    const doctorId = this.route.snapshot.queryParamMap.get('doctor');
    if (doctorId) {
      this.selectedUser = { id: doctorId, name: doctorId };
      console.log('Selected user set from query param:', this.selectedUser);
    }
    await this.chatService.init();

    this.subs.push(
      this.chatService.connectionStatus$.subscribe(status => this.isOnline = status)
    );

    this.subs.push(
      this.chatService.messages$.subscribe((msg: ReceiveMessage) => {
        console.log('Incoming message:', msg);

        // For doctor: auto-create selectedUser if not set
        if (!this.selectedUser) {
          this.selectedUser = { id: msg.fromUserId, name: msg.fromUserId };
        }

        if (this.selectedUser.id === msg.fromUserId) {
          this.messages.push({
            text: msg.message,
            fromMe: false,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          this.scrollToBottom();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.chatService.close();
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.selectedUser) return;

    const msg = this.messageText;
    console.log('Sending message to user:', this.selectedUser.id, 'Message:', msg);

    this.chatService.sendMessage(this.selectedUser.id, msg);

    this.messages.push({
      text: msg,
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.messageText = '';
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        this.msgContainer.nativeElement.scrollTop = this.msgContainer.nativeElement.scrollHeight;
      } catch { }
    }, 50);
  }
}
