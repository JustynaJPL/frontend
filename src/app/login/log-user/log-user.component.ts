import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common"; // Importuj CommonModule
import { HttpClientModule } from "@angular/common/http"; // Importuj HttpClientModule
import { LoggerService } from "../logger.service"; // Importuj LoggerService
import { Router } from "@angular/router"; // Importuj Router

@Component({
  selector: "app-log-user",
  templateUrl: "./log-user.component.html",
  styleUrls: ["./log-user.component.sass"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule, // Dodaj HttpClientModule do importów
  ],
})
export class LogUserComponent implements OnInit {
  loginForm: FormGroup;
  isPassVisible: boolean = false;
  loginStatus: string = "";

  constructor(
    private fb: FormBuilder,
    private loggerService: LoggerService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ["", Validators.required],
      pass: ["", Validators.required],
    });
  }

  ngOnInit(): void {}

  togglePassword() {
    this.isPassVisible = !this.isPassVisible;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log("Form is valid, submitting..."); // Dodane logowanie
      this.loggerService.login(this.loginForm.value).subscribe(
        (response) => {
          localStorage.setItem('token', response.jwt);
            // console.log(localStorage.getItem('token'));
          localStorage.setItem('userId', response.user.id);
            // console.log(localStorage.getItem('userId'));

          this.router.navigate(["/logged"]);
        },
        (error) => {
          console.error("Login failed:", error); // Dodane logowanie błędu
        }
      );
    } else {
      console.warn("Form is invalid"); // Dodane logowanie w przypadku nieprawidłowego formularza
    }
  }
}
