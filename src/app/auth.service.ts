import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor() {
    this.checkToken(); // Sprawdzenie tokenu przy inicjalizacji serwisu
  }

  // Ustawianie statusu uwierzytelnienia
  setAuthenticated(value: boolean): void {
    this.isAuthenticated = value;
  }

  // Pobieranie statusu uwierzytelnienia
  getAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // Sprawdzenie obecności tokenu w localStorage
  checkToken(): void {
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token; // Jeśli token istnieje, użytkownik jest zalogowany
  }

  // Wylogowanie użytkownika
  logout(): void {
    localStorage.removeItem('token');
    this.setAuthenticated(false);
  }
}
