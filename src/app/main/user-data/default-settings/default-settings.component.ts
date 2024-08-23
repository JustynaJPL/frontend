import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { LoggerService } from "../../../login/logger.service";
import { CanvasJSAngularChartsModule } from "@canvasjs/angular-charts";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { GDA } from "../../../models/GDA";

@Component({
  selector: "app-default-settings",
  standalone: true,
  imports: [
    CommonModule,
    CanvasJSAngularChartsModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  providers: [],
  templateUrl: "./default-settings.component.html",
  styleUrl: "./default-settings.component.sass",
})
export class DefaultSettingsComponent {
  myGDA!: FormGroup;
  id!: number;
  chartOptions: any;
  chart: any;
  editingdata: boolean = false;
  gdaerror: boolean = false;

  constructor(private loger: LoggerService) {
    this.myGDA = new FormGroup({
      kcal: new FormControl(0),
      bialka: new FormControl(0),
      tluszcze: new FormControl(0),
      weglowodany: new FormControl(0),
    });

    this.chartOptions = {
      animationEnabled: true,
      theme: "dark2",
      title: {
        text: "GDA",
      },
      data: [
        {
          type: "pie",
          startAngle: 45,
          indexLabel: "{name}: {y}",
          indexLabelPlacement: "inside",
          yValueFormatString: "#,###.##'%'",
          dataPoints: [
            { y: 1, name: "Białko" },
            { y: 1, name: "Węglowodany" },
            { y: 1, name: "Tłuszcze" },
          ],
        },
      ],
    };
  }

  ngOnInit() {
    this.loger.getGda().subscribe((response) => {
      // Aktualizacja wartości formularza
      this.myGDA.patchValue({
        kcal: response.kcal,
        bialka: response.bialka,
        weglowodany: response.weglowodany,
        tluszcze: response.tluszcze,
      });

      // Tworzenie nowej tablicy danych do wykresu
      let noweDane = [
        { y: this.myGDA.get("bialka")?.value, name: "Białko" },
        { y: this.myGDA.get("weglowodany")?.value, name: "Węglowodany" },
        { y: this.myGDA.get("tluszcze")?.value, name: "Tłuszcze" },
      ];

      // Aktualizacja danych wykresu
      this.updateChartData(noweDane);
    });

    this.loger.getUserDBID().subscribe((re) => {
      this.id = re;
    });
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

  checkGDA(): boolean {
    if (
      this.myGDA.get("kcal")?.value > 1200 &&
      this.myGDA.get("kcal")?.value <= 5000
    ) {
      if (
        this.myGDA.get("weglowodany")?.value < 10 ||
        this.myGDA.get("bialka")?.value < 10 ||
        this.myGDA.get("tluszcze")?.value < 10
      ) {
        return false;
      } else {
        let sum: number =
          this.myGDA.get("weglowodany")?.value +
          this.myGDA.get("bialka")?.value +
          this.myGDA.get("tluszcze")?.value;
        if (sum == 100) return true;
        else return false;
      }
    } else {
      return false;
    }
  }

  onSubmit() {
    if (this.myGDA.valid) {
      if (this.checkGDA()) {
        let ugda: GDA = {
          kcal: this.myGDA.get("kcal")?.value,
          weglowodany: this.myGDA.get("weglowodany")?.value,
          bialka: this.myGDA.get("bialka")?.value,
          tluszcze: this.myGDA.get("tluszcze")?.value,
        };
        this.loger.updateGDA(ugda, this.id).subscribe((response) => {
          // Tworzenie nowej tablicy danych do wykresu po aktualizacji
          let noweDane = [
            { y: this.myGDA.get("bialka")?.value, name: "Białko" },
            { y: this.myGDA.get("weglowodany")?.value, name: "Węglowodany" },
            { y: this.myGDA.get("tluszcze")?.value, name: "Tłuszcze" },
          ];

          // Aktualizacja danych wykresu
          this.updateChartData(noweDane);
        });
        this.editingdata = !this.editingdata;
      } else {
        this.gdaerror = true;
      }
    }
  }

  startedit() {
    this.editingdata = !this.editingdata;
  }

  onInputKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "NumPad0",
      "NumPad1",
      "NumPad2",
      "NumPad3",
      "NumPad4",
      "NumPad5",
      "NumPad6",
      "NumPad7",
      "NumPad8",
      "NumPad9",
      "ArrowLeft",
      "ArrowRight",
      "Backspace",
      "Delete",
      "Enter",
    ];
    this.gdaerror = false;

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
