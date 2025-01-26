import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { LoggerService } from "../../../login/logger.service";
import { MatInputModule } from "@angular/material/input";
import { concatMap } from "rxjs";

@Component({
  selector: "app-cpm",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: "./cpm.component.html",
  styleUrl: "./cpm.component.sass",
})
export class CpmComponent {
  ppm: number;
  pal: { label: string; min: number; max: number }[] = [];
  cpm: { label: string; min: number; max: number }[] = [];
  userData!: FormGroup;
  sport: string[] = [];

  constructor(private loger: LoggerService, private cdr: ChangeDetectorRef) {
    this.userData = new FormGroup({
      sport: new FormControl(""),
      cpm: new FormControl("0")
    });

    this.ppm = Number(localStorage.getItem("ppm") || 0);

    this.pal = [
      { label: "low", min: 1.4, max: 1.69 },
      { label: "medium", min: 1.7, max: 1.99 },
      { label: "high", min: 2.0, max: 2.4 },
    ];
  }

  ngOnInit(): void {
    this.loger.getsport().pipe(
      concatMap((response: any) => {
        // Przypisz dane sportów
        this.sport = response?.sport || [];

        // Zwróć Observable do drugiej subskrypcji
        return this.loger.getMyData();
      })
    ).subscribe({
      next: (response: any) => {
        // Aktualizacja userData
        this.userData.patchValue(response);
        console.log(this.userData.value);

        // Oblicz CPM
        this.cpm = [
          { label: "low", min: parseFloat((1.4 * this.ppm).toFixed(2)), max: parseFloat((1.69 * this.ppm).toFixed(2)) },
          { label: "medium", min: parseFloat((1.7 * this.ppm).toFixed(2)), max: parseFloat((1.99 * this.ppm).toFixed(2)) },
          { label: "high", min: parseFloat((2.0 * this.ppm).toFixed(2)), max: parseFloat((2.4 * this.ppm).toFixed(2)) },
        ];
        console.log(this.cpm);

        // Logika wyboru cpm na podstawie sportu
        this.changeSport();
      },
      error: (err) => {
        // Obsługa błędów
        console.error("Błąd podczas pobierania danych:", err);
        alert("Wystąpił błąd podczas ładowania danych. Spróbuj ponownie później.");
      },
    });
  }


  changeSport() {
    switch (this.userData.get('sport')?.value) {
      case this.sport.at(0):
        this.userData.get("cpm")?.setValue(`${this.cpm.at(0)?.min} - ${this.cpm.at(0)?.max}`);
        break;
      case this.sport.at(1):
        this.userData.get("cpm")?.setValue(`${this.cpm.at(1)?.min} - ${this.cpm.at(1)?.max}`);
        break;
      case this.sport.at(2):
        this.userData.get("cpm")?.setValue(`${this.cpm.at(2)?.min} - ${this.cpm.at(2)?.max}`);
        break;
      default:
        this.userData.get("cpm")?.setValue("Niedostateczne dane");
    }
    console.log(this.userData.get('cpm')?.value);

    // Wymuszenie odświeżenia widoku
    this.cdr.detectChanges();
  }
}
