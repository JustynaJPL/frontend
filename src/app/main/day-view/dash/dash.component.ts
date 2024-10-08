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

import { GDA } from "../../../models/GDA";
import { CanvasJSAngularChartsModule } from "@canvasjs/angular-charts";
import { MatNativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerInputEvent, MatDatepickerModule } from "@angular/material/datepicker";
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
  }

  onDateChange($event: MatDatepickerInputEvent<any,any>) {

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
