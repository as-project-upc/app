import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService, ReceiveMessage } from '../services/chat.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AngularMaterialModule } from '../ang-material.module';
import { environment } from '../../environments/environment.development';
import { OpaqueService } from '../services/opaque.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements OnInit, OnDestroy {
  selectedUser: { id: string; name: string } | null = null;
  messages: { text: string; fromMe: boolean; time: string }[] = [];
  messageText = '';
  isOnline = false;
  onlineUsers: any;
  filteredUsers: any = [];
  searchUser: string = '';
  username: any;

  private subs: Subscription[] = [];
  @ViewChild('msgContainer') msgContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private authService: OpaqueService
  ) {}

  async ngOnInit() {
    this.username = this.authService.username;
    const doctorId = this.route.snapshot.queryParamMap.get('doctor');
    if (doctorId) {
      this.selectedUser = { id: doctorId, name: doctorId };
    }
    await this.chatService.init();

    this.subs.push(
      this.chatService.connectionStatus$.subscribe(status => (this.isOnline = status))
    );

    this.chatService.onlineUsers$.subscribe(async users => {
      this.onlineUsers = await Promise.all(
        users.map(async user => {
          const r = await fetch(`${environment.apiBaseUrl}/api/user/${user}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          return await r.json();
        })
      );
      this.filteredUsers = this.onlineUsers.filter((u: any) => u.username !== this.username);
    });

    this.subs.push(
      this.chatService.messages$.subscribe((msg: ReceiveMessage) => {
        console.log('Incoming message:', msg);

        if (!this.selectedUser) {
          const user = this.filteredUsers.find((u: any) => u.id === msg.fromUserId);
          this.selectedUser = { id: msg.fromUserId, name: user.name };
        }

        if (this.selectedUser.id === msg.fromUserId) {
          this.messages.push({
            text: msg.message,
            fromMe: false,
            time: new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
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

  selectUser(user: any) {
    this.selectedUser = user;
  }

  searchUsers() {
    const term = this.searchUser.toLowerCase();

    this.filteredUsers = this.onlineUsers.filter(
      (user: any) =>
        user.name.toLowerCase().includes(term) || user.lastMessage?.toLowerCase().includes(term)
    );
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.selectedUser) return;

    const msg = this.messageText;
    console.log('Sending message to user:', this.selectedUser.id, 'Message:', msg);

    this.chatService.sendMessage(this.selectedUser.id, msg);

    this.messages.push({
      text: msg,
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    this.messageText = '';
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        this.msgContainer.nativeElement.scrollTop = this.msgContainer.nativeElement.scrollHeight;
      } catch {}
    }, 50);
  }
}
