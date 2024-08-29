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

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log("Form is valid, submitting...");

      this.loggerService.login(this.loginForm.value).subscribe(
        () => {
          console.log('Login successful');
          this.router.navigate(["/logged"]);
          // Tutaj możemy dodać dodatkowe działania po zalogowaniu
        },
        (error) => {
          console.error("Login failed:", error);
        }
      );
    } else {
      console.warn("Form is invalid");
    }
  }
}
