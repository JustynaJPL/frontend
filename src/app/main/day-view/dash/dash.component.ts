import { Component, inject } from "@angular/core";
import { Breakpoints, BreakpointObserver } from "@angular/cdk/layout";
import { map, switchMap } from "rxjs/operators";
import { AsyncPipe, CommonModule } from "@angular/common";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { DatabaseConnectorService } from "../../../database-services/database-connector.service";
import { BreakfastComponent } from "../breakfast/breakfast.component";
import { LunchComponent } from "../lunch/lunch.component";
import { DinnerComponent } from "../dinner/dinner.component";
import { SupperComponent } from "../supper/supper.component";
import { GDA } from "../../../models/GDA";
import { CanvasJSAngularChartsModule } from "@canvasjs/angular-charts";
import { MatNativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MealsService } from "../meals.service";
import { CommonEngine } from "@angular/ssr";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-dash",
  templateUrl: "./dash.component.html",
  styleUrl: "./dash.component.sass",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    AppNaviComponent,
    BreakfastComponent,
    LunchComponent,
    DinnerComponent,
    SupperComponent,
    CanvasJSAngularChartsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class DashComponent {
  GDAvalues: GDA[] = [];
  sumGDA: GDA;
  chartOptions: any;
  chart: any;
  errorMessage: string;
  selectedDateValue: string;

  constructor(private meals: MealsService) {
    this.chartOptions = {
      animationEnabled: true,
      theme: "dark2",
      title: {
        text: "Wartości makroskładników",
      },
      data: [
        {
          type: "pie",
          startAngle: 45,
          // indexLabel: "{name}: {y}",
          // indexLabelPlacement: "inside",
          // yValueFormatString: "#,###.##'%'",
          dataPoints: [{ y: 1, name: "" }],
        },
      ],
    };
    //

    this.sumGDA = {
      kcal: 0,
      bialka: 0,
      tluszcze: 0,
      weglowodany: 0,
    };

    this.errorMessage = "";

    this.selectedDateValue = this.dayToday();
    this.meals.updateSelectedDate(this.selectedDateValue);
  }

  ngOnInit(): void {
    // Subskrybujemy zmiany daty
    this.meals.selectedDate$.subscribe((date: string) => {
      this.selectedDateValue = date;
    });

    // Subskrybujemy dane GDA i aktualizujemy wartości
    this.meals.gdaData$.subscribe(
      (gdaValues: GDA[]) => {
        this.GDAvalues = gdaValues; // Przypisujemy zwrócone dane do zmiennej

        // Sumujemy wartości
        this.sumGDA = this.sumValues(this.GDAvalues);

        // Zaktualizuj dane na wykresie
        const chartDataPoints = [
          { y: this.sumGDA.bialka, name: "Białka" },
          { y: this.sumGDA.tluszcze, name: "Tłuszcze" },
          { y: this.sumGDA.weglowodany, name: "Węglowodany" },
        ];
        this.updateChartData(chartDataPoints); // Aktualizujemy dane na wykresie
      },
      (error) => {
        console.error('Błąd podczas pobierania danych GDA:', error);
        this.errorMessage = 'Nie udało się pobrać danych. Spróbuj ponownie później.';
      }
    );
  }



  onDateChange(event: any): void {
    const selectedDate = event.value; // Pobierz nową datę z eventu
    const formattedDate = this.formatDate(selectedDate); // Sformatuj datę do "YYYY-MM-DD"
    this.meals.updateSelectedDate(formattedDate); // Przekaż sformatowaną datę do serwisu
    this.sumValues(this.GDAvalues);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  dayToday(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
    const year = today.getFullYear();

    return `${year}-${month}-${day}`;
  }

  getChartInstance(chartInstance: any) {
    this.chart = chartInstance;
  }

  updateChartData(newDataPoints: any) {
    if (this.chart && this.chart.options && this.chart.options.data) {
      this.chart.options.data[0].dataPoints = newDataPoints;
      this.chart.render();
    } else {
      console.error(
        "Instancja wykresu nie jest dostępna lub dane są nieprawidłowe."
      );
    }
  }

  sumValues(GDAvalues: GDA[]): GDA {
    let summary: GDA = {
      kcal: 0,
      bialka: 0,
      tluszcze: 0,
      weglowodany: 0,
    };

    if (!GDAvalues || GDAvalues.length === 0) {
      console.log('Brak danych do sumowania.');
      return summary; // Zwracamy pustą sumę, jeśli brak danych
    }

    for (let i = 0; i < GDAvalues.length; i++) {
      const gda = GDAvalues[i];
      if (gda) { // Sprawdzenie, czy element istnieje
        console.log('Dodawanie pozycji:', gda);
        summary.kcal += gda.kcal;
        summary.weglowodany += gda.weglowodany;
        summary.bialka += gda.bialka;
        summary.tluszcze += gda.tluszcze;
      }
    }

    console.log('Suma po dodaniu:', summary); // Loguj wynik sumowania
    return summary;
  }



  normalizeToChart(sumValues: GDA): GDA {
    let on100percent: number =
      sumValues.bialka + sumValues.tluszcze + sumValues.weglowodany;

    return (sumValues = {
      kcal: sumValues.kcal,
      tluszcze: (sumValues.tluszcze / on100percent) * 100,
      weglowodany: (sumValues.weglowodany / on100percent) * 100,
      bialka: (sumValues.bialka / on100percent) * 100,
    });
  }
}
