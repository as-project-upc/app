import { Injectable } from '@angular/core';
import { Client } from './opaque-client.service';
import { OpaqueService } from '../../services/opaque.service';

@Injectable({ providedIn: 'root' })
export class LockerService {
  private client!: Client;
  private baseUrl = 'http://localhost:3000';

  constructor(private authService: OpaqueService) {
    this.client = new Client(this.baseUrl);
    this.client.token = localStorage.getItem('authToken') ?? undefined;
    this.client.loadFromStorage();
  }

  async uploadEncryptedFile(fileName: string, data: string) {
    if (!this.client) throw new Error('Client not initialized');

    const bytes = new TextEncoder().encode(data);
    const encrypted = await this.client.encryptData(bytes);

    console.log(this.client.token)
    const formData = new FormData();
    formData.append('file', new Blob([encrypted]), fileName);

    const res = await fetch(`${this.baseUrl}/api/locker/${fileName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token}`
      },
      body: formData,
    });

    return res.json();
  }

  async downloadEncryptedFile(fileName: string) {
    if (!this.client) throw new Error('Client not initialized');

    const res = await fetch(`${this.baseUrl}/api/locker/${fileName}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.client.token}` },
    });

    const data = new Uint8Array(await res.arrayBuffer());
    const decrypted = await this.client.decryptData(data);
    return new TextDecoder().decode(decrypted);
  }

  async deleteFile(fileName: string) {
    if (!this.client) throw new Error('Client not initialized');

    const res = await fetch(`${this.baseUrl}/api/locker/${fileName}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.client.token}` },
    });

    return res.json();
  }

  async listFiles() {
    if (!this.client) throw new Error('Client not initialized');

    const res = await fetch(`${this.baseUrl}/api/locker`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.client.token}` },
    });

    return res.json();
  }

  async uploadEncryptedFileBlob(file: File, filename: string) {
    if (!this.client) throw new Error('Client not initialized');

    const arrayBuffer = await file.arrayBuffer();
    const encrypted = await this.client.encryptData(new Uint8Array(arrayBuffer));

    const formData = new FormData();
    formData.append('file', new Blob([encrypted]), filename);

    const res = await fetch(`${this.baseUrl}/api/locker/${filename}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.client.token}` },
      body: formData
    });

    return res.json();
  }

  async downloadEncryptedBlob(fileName: string): Promise<Blob> {
    if (!this.client) throw new Error('Client not initialized');

    const res = await fetch(`${this.baseUrl}/api/locker/${fileName}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.client.token}` },
    });

    const encrypted = new Uint8Array(await res.arrayBuffer());

    const decrypted = await this.client.decryptData(encrypted);

    return new Blob([decrypted], { type: "image/jpeg" });
  }


  async uploadFile(file: File, filename: string) {
    if (!this.client) throw new Error('Client not initialized');

    const formData = new FormData();
    formData.append('file', file, filename);

    const res = await fetch(`${this.baseUrl}/api/locker/${filename}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token}`,
      },
      body: formData,
    });

    return res.json();
  }


}
