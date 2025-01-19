import { Kategoria } from "./../../../models/Kategoria";
import { Component, inject } from "@angular/core";
import { Breakpoints, BreakpointObserver } from "@angular/cdk/layout";
import { catchError, map, switchMap, takeUntil } from "rxjs/operators";
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
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MealsService } from "../meals.service";
import { CommonEngine } from "@angular/ssr";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { combineLatest, Observable, Subject } from "rxjs";
import { Posilek } from "../../../models/Posilek";
import { DefaultDataPoint, PieDataPoint } from "chart.js";
import { ActivatedRoute, Router } from "@angular/router";

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
    MatTableModule,
  ],
})
export class DashComponent {
  GDAvalues: GDA[] = [];
  sumGDA: GDA;
  chartOptions: any;
  chart: any;
  errorMessage: string;

  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [
    "name",
    "weightOrPortions",
    "macros",
    "actions",
    "add"
  ];

  public kategorie$: Observable<Kategoria[]>;
  public selectedDateValue$: Observable<string>;
  public posilki$: Observable<Posilek[]>;

  public groupedPosilki: { [key: number]: Posilek[] } = {};

  constructor(private meals: MealsService ,
    private router: Router,
    private route: ActivatedRoute) {
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

    this.selectedDateValue$ = this.meals.currentDate$;
    this.kategorie$ = this.meals.kategorie$;
    this.posilki$ = this.meals.posilki$;
  }

  ngOnInit(): void {
    this.posilki$.subscribe((posilki) => {
      console.log('Posiłki załadowane:', posilki);
      this.groupedPosilki = this.groupByCategory(posilki);
      this.sumGDAValues(posilki);
      this.updateChartData(this.createdatapointsforchart(this.sumGDA));
    });

    combineLatest([
      this.meals.getKategorie(),
      this.meals.getCurrData()
    ])
    .pipe(
      switchMap(([kategorie, currData]) => {
        console.log('Kategorie i data załadowane:', kategorie, currData);
        return this.meals.loadPosilki();
      }),
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('Błąd podczas pobierania danych:', error);
        return [];
      })
    )
    .subscribe();
  }


  ngOnDestroy() {
    // Zakończ subskrypcję, gdy komponent zostanie zniszczony
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDateChange($event: MatDatepickerInputEvent<any, any>) {
    const date:string = this.formatDate($event.target.value);
    this.meals.setDate(date);
  }

  // {funkcje dotyczące formatowania wykresu w zależnosci od danych

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

  createdatapointsforchart(gda:GDA):any{
    gda = this.normalizeToChart(gda);
    return [{ y: gda.bialka, name: "Białka" },
            { y: gda.weglowodany, name: "Węglowodany" },
            { y: gda.tluszcze, name: "Tłuszcze" } ] ;
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

  // funkcje dotyczące formatowania wykresu w zależnosci od danych}

  deleteMeal(id: number): void {
    this.meals.deletePosilekofId(id);
    console.log('Usunięto element', id);

    // Odświeżanie danych po usunięciu
    this.meals.loadPosilki().subscribe((posilki) => {
      console.log('Dane zaktualizowane po usunięciu:', posilki);
      this.groupedPosilki = this.groupByCategory(posilki);
      this.sumGDAValues(posilki);
      this.updateChartData(this.createdatapointsforchart(this.sumGDA));
    });
  }

  checkMeal(id:number, mode:string) {
    this.router.navigate(['../change-meal/', id, mode], { relativeTo: this.route });
  }

  /* funkcja ta grupuje dane z posilki w kategorie poprzez
  // dodanie do nich klucza wcześniej
  // polega ona na tym że najpierw sprawdzana jest czy trzeba
  // dodać kategorie, potem jeśli trzeba to tworzy nową i
  // przechodzi do posiłku który analizuje pod względem przynależności
  // i wpycha go do obiektu
  // przykład {
  //   1: [ { id: 1, nazwa: 'Jabłko', idkategoria: 1 },
  //        { id: 2, nazwa: 'Gruszka', idkategoria: 1 },
  //        { id: 5, nazwa: 'Banany', idkategoria: 1 }
  //      ],
  //   2: [ { id: 3, nazwa: 'Kurczak', idkategoria: 2 } ],
  //   3: [ { id: 4, nazwa: 'Ryż', idkategoria: 3 } ]
  // } */
  groupByCategory(posilki: Posilek[]): { [key: number]: Posilek[] } {
    return posilki.reduce((acc, posilek) => {
      const categoryId = posilek.idkategoria;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(posilek);
      return acc;
    }, {} as { [key: number]: Posilek[] });
  }

  sumGDAValues(p:Posilek[]){
    if(p.length===0) console.log(p);
    for (let i = 0; i < p.length; i++) {
      this.sumGDA.kcal = this.sumGDA.kcal + p[i].posilekGDA.kcal;
      this.sumGDA.bialka = this.sumGDA.bialka + p[i].posilekGDA.bialka;
      this.sumGDA.tluszcze = this.sumGDA.tluszcze + p[i].posilekGDA.tluszcze;
      this.sumGDA.weglowodany = this.sumGDA.weglowodany + p[i].posilekGDA.weglowodany;
    }
    console.log(this.sumGDA);
  }

  addNew(id:number){
    this.router.navigate(['../add-meal/', id], { relativeTo: this.route });
  }

  showShoppingList(){
    this.router.navigate(['../shopping-list'],  { relativeTo: this.route });

  }
}
