import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  getBooks(page: number, limit: number): Observable<any> {
    const url = `${this.apiUrl}/books?page=${page}&limit=${limit}`;
    return this.http.get(url);
  }

  getBorrowedBooksforUser(
    userId: string,
    page?: number,
    limit?: number
  ): Observable<any> {
    const url = `${this.apiUrl}/borrow/borrowed-books/${userId}?page=${page}&limit=${limit}`;
    return this.http.get(url);
  }

  getBorrowedBooksforAdmin(
    page: number,
    limit: number,
    search?: string
  ): Observable<any> {
    const url = `${this.apiUrl
      }/borrow/all-books?page=${page}&limit=${limit}&search=${search ? search : ''
      }`;
    return this.http.get(url);
  }

  getAllUsers(page: number, limit: number): Observable<any> {
    const url = `${this.apiUrl}/auth/profiles?page=${page}&limit=${limit}`;
    return this.http.get(url);
  }
  deleteBook(bookId: string): Observable<any> {
    const url = `${this.apiUrl}/books/${bookId}`;
    return this.http.delete(url);
  }
  updateBook(bookId: string, requestBody: any): Observable<any> {
    const url = `${this.apiUrl}/books/${bookId}`;
    return this.http.put(url, requestBody);
  }
  borrowBook(data: any): Observable<any> {
    const url = `${this.apiUrl}/borrow`;
    return this.http.post(url, data);
  }
  returnBook(bookId: string): Observable<any> {
    const url = `${this.apiUrl}/borrow/return/${bookId}`;
    const body = {};
    return this.http.post(url, body);
  }

  getBookDetails(bookId: string): Observable<any> {
    const url = `${this.apiUrl}/borrow/details/${bookId}`;
    return this.http.get(url);
  }

  getSingleUserProfile(id: string): Observable<any> {
    const url = `${this.apiUrl}/auth/profile/${id}`;
    return this.http.get(url);
  }

  updateProfile(id: string, profileData: any): Observable<any> {
    const url = `${this.apiUrl}/auth/profile/${id}`;
    return this.http.put(url, profileData);
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.apiUrl}/auth/delete-user/${userId}`;
    return this.http.delete(url);
  }

  getBookById(book_id: string): Observable<any> {
    const url = `${this.apiUrl}/books/${book_id}`;
    return this.http.get(url);
  }

  addBooks(data: any): Observable<any> {
    const url = `${this.apiUrl}/books`;
    return this.http.post(url, data);
  }

  sendReminderEmail(data: any): Observable<any> {
    const url = `${this.apiUrl}/borrow/send-reminder-email`;
    return this.http.post(url, data);
  }
}
