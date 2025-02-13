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
import { filter, forkJoin, map, Subject, switchMap, takeUntil } from "rxjs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { WygenerowanyPlan } from "../../../models/WygenerowanyPlan";
import { DatabaseConnectorService } from "../../database-connector.service"
import { GenPosilek } from "../../../models/GenPosilek";

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
    MatProgressSpinnerModule,
  ],
})
export class ResultsComponent {
  generateData: FormGroup;
  kategorie: Kategoria[] = [];
  cards: KartaPlanu[] = [];
  valuesareloaded: boolean = false;
  plan!: WygenerowanyPlan;
  uid: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private genService: GeneratePlanService,
    private fb: FormBuilder,
    private location: Location,
    private meals: MealsService,
    private db: DatabaseConnectorService
  ) {
    this.generateData = fb.group({
      kcal: [0],
      datapoczatkowa: [""],
      datazakonczenia: [""],
    });
  }

  // ta funkcja powoduje wygenerowanie kart dla wszytskich dni planu z
  // określeniem ich daty - dodaje puste karty żeby na ich podstawie wygenrować
  //karty w komponencie
  private generateCards() {
    this.cards = [];
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
        filter((formData) => formData !== null),
        switchMap((formData) => {
          this.generateData.patchValue(formData!.value);
          return this.meals.getKategorie();
        }),
        takeUntil(this.destroy$) // Odsubskrybowanie przy zniszczeniu komponentu
      )
      .subscribe((response) => {
        this.kategorie = response;
        this.generateCards();
        this.generateData.disable();
      });

    this.genService.results$
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => {
        this.plan = plan;
        for (let i = 0; i < 7; i++) {
          this.cards[i].posilki = plan.dni[i];
        }
        this.valuesareloaded = true;
      });

    this.db.getUserDBID()
      .pipe(takeUntil(this.destroy$))
      .subscribe((id: number) => {
        this.uid = id;
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

      if (i == 6) {
        this.generateData.get("datazakonczenia")?.setValue(formattedDate);
      }
    }
    return dates;
  }

  returnDayofWeek(date: string): string {
    const daysOfWeek = [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  }

  returnPosilekName(cardId: number, kat: number): string {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return ""; // Jeśli nie ma karty, zwracamy pusty string

    //Spłaszczamy tablicę `posilki`, jeśli jest wielowymiarowa
    const allMeals = card.posilki.flat();

    // Szukamy posiłku pasującego do kategorii
    const posilek = allMeals.find((p) => p.idKategorii === kat);

    // console.log(`Znaleziony posiłek dla cardId=${cardId}, kat=${kat}:`, posilek);

    return posilek ? posilek.nazwaPrzepisu : "Brak posiłku";
  }

  addMeals() {
    let meals: GenPosilek[] = [];

    for (let i = 0; i < this.cards.length; i++) {
      let dailyMeals: any = this.cards[i].posilki[0];
      for (let j = 0; j < dailyMeals.length; j++) {
        let meal: GenPosilek = {
          dataposilku: this.cards[i].data,
          ilosc: 1,
          kategoria: dailyMeals[j].idKategorii,
          nazwa: dailyMeals[j].idPrzepisu,
          kcal: 0,
          bialka: 0,
          tluszcze: 0,
          weglowodany: 0,
        };
        meals.push(meal);
      }
    }

    // Najpierw pobierz dane o porcji dla wszystkich posiłków
    const portionRequests = meals.map((meal) =>
      this.db.getRecipePortionData(meal.nazwa).pipe(
        map((response) => {
          const perPortion = response.data.attributes.perPortion;
          meal.kcal = perPortion.kcal;
          meal.bialka = perPortion.bialka;
          meal.tluszcze = perPortion.tluszcze;
          meal.weglowodany = perPortion.weglowodany;
          return meal;
        })
      )
    );

    forkJoin(portionRequests)
      .pipe(
        switchMap((updatedMeals) => {
          console.log("Zaktualizowane dane posiłków:", updatedMeals);

          // Teraz odpalamy addMealPosilek dla każdego posiłku
          const addMealRequests = updatedMeals.map((meal) =>
            this.meals.addMealPosilek(meal, this.uid)
          );

          return forkJoin(addMealRequests);
        })
      )
      .subscribe({
        next: (results) => {
          console.log("Wszystkie posiłki zostały dodane do bazy:", results);
        },
        error: (err) => {
          console.error("Wystąpił błąd podczas dodawania posiłków:", err);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
