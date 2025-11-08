import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppHttpClient {
  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  post<T>(url: string, body?: any): Observable<T> {
    return this.http.post<T>(url, body, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  put<T>(url: string, body?: any): Observable<T> {
    return this.http.put<T>(url, body, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
