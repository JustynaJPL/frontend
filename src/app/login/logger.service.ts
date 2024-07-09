import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private apiUrl = 'http://localhost:1337/api/auth/local';

  constructor(private http: HttpClient) {}

  login(credentials: { login: string; pass: string }): Observable<any> {
    const cred = { identifier: credentials.login, password: credentials.pass };
    return this.http.post<any>(this.apiUrl, cred);
  }


  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }
}
