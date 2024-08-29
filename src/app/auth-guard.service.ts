import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.getAuthenticated()) {
      return true; // Jeśli użytkownik jest zalogowany, pozwól nawigować do trasy
    } else {
      this.router.navigate(['login']); // Jeśli nie jest zalogowany, przekieruj na stronę logowania
      return false; // Zablokuj dostęp do trasy
    }
  }
}
