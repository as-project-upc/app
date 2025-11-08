import { Injectable } from '@angular/core';
import { Client } from '../../services/opaque-client';

@Injectable({
  providedIn: 'root',
})
export class OpaqueService {
  private client: Client;

  constructor() {
    this.client = new Client('http://localhost:3000'); // backend URL
  }

  async register(username: string, email: string, password: string, role: string) {
    try {
      const response = await this.client.register(username, email, password, 'user');
      return response;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  }

  async login(username: string, password: string) {
    try {
      const res = await this.client.login(username, password);
      return res;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  }
}
