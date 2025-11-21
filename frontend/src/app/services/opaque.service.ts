import { Injectable } from '@angular/core';
import { Client } from '../shared/services/opaque-client.service';

@Injectable({
  providedIn: 'root',
})
export class OpaqueService {
  private client: Client;
  private _username: string | null = null;
  private _email: string | null = null;
  private _role: string | null = null;

  constructor() {
    this.client = new Client('http://localhost:3000'); // backend URL
  }

  async register(username: string, name: string, surname: string, email: string, password: string, role: any) {
    try {
      const response = await this.client.register(username, name, surname, email, password, role);
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

  setUser(username: string, email: string, role: string) {
    this._username = username;
    this._email = email;
    this._role = role;
  }

  clearUser() {
    this._username = null;
    this._email = null;
  }

  get username(): string | null {
    return this._username;
  }

  get email(): string | null {
    return this._email;
  }

  get role(): string | null {
    return this._role;
  }
}
