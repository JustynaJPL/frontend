import { Component, inject } from "@angular/core";
import { Breakpoints, BreakpointObserver } from "@angular/cdk/layout";
import { map, switchMap } from "rxjs/operators";
import { AsyncPipe } from "@angular/common";
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

@Component({
  selector: "app-dash",
  templateUrl: "./dash.component.html",
  styleUrl: "./dash.component.sass",
  standalone: true,
  imports: [
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
  ],
})
export class DashComponent {
  GDAvalues: GDA[] = [];
  sumGDA: GDA;
  chartOptions: any;
  chart: any;
  errorMessage: string;

  constructor(private db: DatabaseConnectorService) {
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
  }

  ngOnInit(): void {
    const todayDate = this.dayToday(); // Możesz ustawić tutaj dynamiczną datę, np. dzisiejszą

    this.db
      .getUserDBID()
      .pipe(
        switchMap((userId: number) => {
          return this.db.getAllUserGDAofPosilkiofDay(userId, todayDate);
        })
      )
      .subscribe({
        next: (gdaData: GDA[]) => {
          console.log(gdaData);
          this.GDAvalues = gdaData;
          this.sumGDA = this.sumValues(this.GDAvalues);
          let GDAtoChart = this.normalizeToChart(this.sumGDA);
          let datapoints: any = [
            { y: GDAtoChart.bialka, name: "Białka" },
            { y: GDAtoChart.weglowodany, name: "Węglowodany" },
            { y: GDAtoChart.tluszcze, name: "Tłuszcze" },
          ];
          this.updateChartData(datapoints);
        },
        error: (error) => {
          console.error("Błąd podczas pobierania danych GDA:", error);
          this.errorMessage =
            "Nie udało się pobrać danych GDA. Spróbuj ponownie później.";
        },
      });
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
    GDAvalues.forEach((item: GDA) => {
      summary = {
        kcal: summary.kcal + item.kcal,
        weglowodany: summary.weglowodany + item.weglowodany,
        bialka: summary.bialka + item.bialka,
        tluszcze: summary.tluszcze + item.tluszcze,
      };
    });
    return summary;
  }

  normalizeToChart(sumValues:GDA):GDA{
    let on100percent:number = sumValues.bialka + sumValues.tluszcze + sumValues.weglowodany;

    return sumValues = {
      kcal:sumValues.kcal,
      tluszcze:sumValues.tluszcze/on100percent*100,
      weglowodany:sumValues.weglowodany/on100percent*100,
      bialka:sumValues.bialka/on100percent*100
    };
  }
}
