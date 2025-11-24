// src/app/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  listDoctors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/doctors`);
  }

  addAppointment(doctor_id: string, datetime: string): Observable<any> {
    const body = {
      doctor_id: doctor_id,
      date: datetime, // pass the datetime instead of always using now
    };
    return this.http.post(`${this.baseUrl}/api/appointment`, body);
  }

  getAppointmentDetail(appointment_id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/appointment/${appointment_id}`);
  }

  deleteAppointment(appointment_id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/appointment/${appointment_id}`);
  }

  listAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/appointment`);
  }
}
