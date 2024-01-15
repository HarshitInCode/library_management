import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tokenHeader = this.authService.getAuthorizationHeader();
    const modifiedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${tokenHeader.get('Authorization')!}` },
    });

    return next.handle(modifiedRequest).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Handle successful responses
        }
      }),
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.router.navigate(['/']);
        }
        return throwError(error);
      })
    );
  }
}
