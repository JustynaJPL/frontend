import { Component } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { FormGroup, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { GeneratePlanService } from "../generate-plan.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { Location } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { Kategoria } from "../../../models/Kategoria";
import { MealsService } from "../../day-view/meals.service";
import { KartaPlanu } from "../../../models/KartaPlanu";
import { EMPTY, switchMap } from "rxjs";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: "app-results",
  standalone: true,
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.sass",
  imports: [
    AppNaviComponent,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
})
export class ResultsComponent {
  generateData: FormGroup;
  kategorie: Kategoria[] = [];
  cards: KartaPlanu[] = [];
  valuesareloaded:boolean = false;


  constructor(
    private genService: GeneratePlanService,
    private fb: FormBuilder,
    private location: Location,
    private meals: MealsService
  ) {
    this.generateData = fb.group({
      kcal: [0],
      bialka: [0],
      weglowodany: [0],
      tluszcze: [0],
      datapoczatkowa: [""],
      datazakonczenia: [""],
    });


  }

  // ta funkcja powoduje wygenerowanie kart dla wszytskich dni planu z
  // określeniem ich daty - dodaje puste karty żeby na ich podstawie wygenrować
  //karty w komponencie
  private generateCards() {
    let daty: string[] = this.generateDates(
      this.generateData.get("datapoczatkowa")?.value
    );

    for (let i = 1; i < 8; i++) {
      let card: KartaPlanu;
      card = {
        id: i,
        data: daty[i - 1],
        kategorie: this.kategorie,
        posilki: [],
      };
      this.cards.push(card);
    }
    console.log(this.cards);
  }

  ngOnInit() {
    this.genService.formData$
      .pipe(
        switchMap((formData) => {
          if (formData) {
            this.generateData.patchValue(formData.value);
            console.log(formData.value);
            return this.meals.getKategorie();
          } else {
            console.log("Błąd przy wczytywaniu danych z formularza!");
            return EMPTY;
          }
        })
      )
      .subscribe((response) => {
        this.kategorie = response;
        console.log(this.kategorie);
        this.generateCards();
        this.generateData.disable();
      });
  }

  cancel() {
    this.location.back();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  generateDates(startDate: string): string[] {
    const dates: string[] = [];
    let currentDate = new Date(startDate); // Zmieniamy let na mutable

    console.log(currentDate);

    for (let i = 0; i < 7; i++) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);

      // Aktualizujemy currentDate bez błędów stref czasowych
      currentDate.setDate(currentDate.getDate() + 1);

      if(i == 6) {
        this.generateData.get('datazakonczenia')?.setValue(formattedDate);
      }
    }
    return dates;
  }


  returnDayofWeek(date: string): string {
    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa",
       "Czwartek", "Piątek", "Sobota"];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  }

  addMeals(){


  }
}
