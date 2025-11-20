import { Component } from '@angular/core';
import { AngularMaterialModule } from '../ang-material.module';

@Component({
  selector: 'app-chat',
  imports: [AngularMaterialModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
    searchText = '';

  users: any = [
    { id: 1, name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'Hey there!' },
    { id: 2, name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?img=21', lastMessage: 'See you later' },
    { id: 3, name: 'Charlie Davis', avatar: 'https://i.pravatar.cc/150?img=14', lastMessage: 'What’s up?' }
  ];

  selectedUser: any;

  messages: any = [];

  messageText = '';

  get filteredUsers() {
    return this.users.filter((u: any) =>
      u.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.messages = [
      { text: 'Hello!', fromMe: false, time: '10:30' },
      { text: 'Hey there 😄', fromMe: true, time: '10:31' }
    ];
  }

  sendMessage() {
    if (!this.messageText.trim()) return;

    this.messages.push({
      text: this.messageText,
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.messageText = '';
  }
}
