import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  // Import the map operator
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> | boolean {
    return this.authService.token$.pipe(  // Use pipe here
      map((token) => {
        if (token) {
          // User is logged in, allow access
          return true;
        } else {
          // User is not logged in, redirect to the login page
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
