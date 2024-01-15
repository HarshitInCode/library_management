import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/v1/auth';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private tokenInitializedPromise: Promise<void>;

  constructor(private http: HttpClient) {
    this.tokenInitializedPromise = this.initializeToken();
  }

  private async initializeToken(): Promise<void> {
    const token = localStorage.getItem('token');
    this.tokenSubject.next(token);
  }

  async getToken(): Promise<string | null> {
    await this.tokenInitializedPromise;
    return this.tokenSubject.getValue();
  }

  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  private setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(user);
  }

  getUser(): any | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.baseUrl}/login`, body).pipe(
      tap((response: any) => {
        const token = response.user.token;
        this.setUser(response.user);
        this.setToken(token);
      })
    );
  }

  signup(fName: string, email: string, password: string, role: string): Observable<any> {
    const body = { fName, email, password, role };
    return this.http.post(`${this.baseUrl}/register`, body);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  getAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  authenticatedRequest<T>(method: string, url: string, body?: any): Observable<T> {
    return this.token$.pipe(
      tap((token) => {
        if (!token) {
          throw new Error('Token is not available.');
        }
      }),
      switchMap(() => {
        const options = { headers: this.getAuthorizationHeader() };
        return this.http.request<T>(method, `${this.baseUrl}/${url}`, { ...options, body });
      })
    );
  }
}
