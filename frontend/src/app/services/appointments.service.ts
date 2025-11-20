import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

private getAuthHeaders() {
  const token = localStorage.getItem('authToken');

  return new HttpHeaders({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });
}


  addAppointment(userId: string, request: any) {
    return this.http.post(
      `${this.baseUrl}/appointment/${userId}`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  listAppointments() {
    return this.http.get(
      `${this.baseUrl}/appointment`,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteAppointment(request: any) {
    return this.http.delete(
      `${this.baseUrl}/appointment`,
      {
        headers: this.getAuthHeaders(),
        body: request
      }
    );
  }
}
