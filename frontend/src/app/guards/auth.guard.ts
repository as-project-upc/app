import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate, CanActivateChild  {
  constructor(//private staffService: StaffService,
   private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean> {
    return of(true)
    // return this.staffService.getStaffProfile().pipe(
    //   map(user => {
    //     console.log('User is authenticated:', user);
    //     this.staffService.setUserProfile(user);
    //     return true;
    //   }),
    //   catchError(error => {
    //     console.error('User is not authenticated:', error);
    //     this.staffService.setUserProfile(null);
    //     this.router.navigate(['/login']);
    //     return of(false);
    //   })
    // );
  }

}
