import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.isAuthenticated = !!token; // Ustawienie flagi logowania
    } else {
      this.isAuthenticated = false; // Na serwerze domyślnie false
    }
  }

  // Wylogowanie użytkownika
  logout(): void {
    localStorage.removeItem('token');
    this.setAuthenticated(false);
  }

}
