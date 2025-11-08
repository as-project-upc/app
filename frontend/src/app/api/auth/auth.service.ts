import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthEndpoints } from './auth.endpoints';
import { AppHttpClient } from '../../shared/services/app-http-client.service';
import { LoginStartRequest, RegistrationStartRequest } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 constructor(private http: AppHttpClient) {}

  private isAuthenticated = false;

  loginIn(request: LoginStartRequest) : Observable<boolean> {
    return this.http.post<any>(AuthEndpoints.loginStart, request);
  }

  register(request: RegistrationStartRequest) : Observable<boolean> {
    return this.http.post<any>(AuthEndpoints.registerStart, request);
  }


  logout(): Observable<boolean>  {
    console.log(AuthEndpoints.logout)
    return this.http.post<any>(AuthEndpoints.logout);
  }
}
