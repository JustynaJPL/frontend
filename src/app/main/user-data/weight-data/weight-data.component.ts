import { Component } from '@angular/core';
import { LoggerService } from '../../../login/logger.service';
import { WeightData } from '../../../models/OdczytWagi';
import { response } from 'express';
import { catchError, switchMap, throwError } from 'rxjs';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-weight-data',
  standalone: true,
  imports: [CommonModule,
            CanvasJSAngularChartsModule,
            MatButtonModule, MatIconModule,
            MatFormFieldModule,MatInputModule,
            ReactiveFormsModule,MatCardModule
          ],
  templateUrl: './weight-data.component.html',
  styleUrl: './weight-data.component.sass'
})
export class WeightDataComponent {
  measures:WeightData[] = [];
  uid:number = 0;
  chartOptions: any;
  chart: any;
  noWdata:string = 'data';
  weightData:FormGroup;

  constructor(private loger:LoggerService){

    this.chartOptions = {
      theme: "dark2",
      animationEnabled: true,
      zoomEnabled: true,
      title: {
        text: ""
      },
      axisX:{
        valueFormatString: "DD.MM.YYYY"
      },
      data: [{
        type: "line",
        xValueFormatString: "DD.MM.YYYY",
        yValueFormatString: "###.##",
        dataPoints: []
      }]
    };

    this.weightData = new FormGroup({
        weight: new FormControl(0),
        wdata: new FormControl(new Date())
      });
  }

  ngOnInit() {
    this.loger.getMyData().pipe(
      switchMap((response) => {
        this.uid = response.id;
        console.log('Id = ' + this.uid);
        return this.loger.getWeightDataOfUserWithID(this.uid);
      })
    ).subscribe((response) => {
      if(response.length == 0 ) this.noWdata = 'no-data';
      else{
      this.measures = response;
      console.log('Measures = ', response);

      // Sortowanie rekordów według daty (wdate)
      this.measures.sort((a, b) => a.wdate.getTime() - b.wdate.getTime());

      // Tworzenie tablicy ndata po sortowaniu
      let ndata: { x: Date; y: number; }[] = [];
      this.measures.forEach(element => {
        ndata.push({ x: element.wdate, y: element.wv });
      });

      // Aktualizacja danych wykresu
      this.updateChartData(ndata);
    }
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

  onClick(){
    this.noWdata = 'add';

  }

  onSubmit() {
    this.noWdata = 'data';
    let data: WeightData;

    data = {
        wv: this.weightData.get('weight')?.value,
        wdate: this.weightData.get('wdata')?.value
    }

    this.loger.addWagaofUser(data, this.uid).pipe(
        catchError((error) => {
            console.error('Error adding weight data:', error);
            // Optionally, you can return a custom error message or rethrow the error
            return throwError(() => new Error('Failed to add weight data. Please try again later.'));
        })
    ).subscribe({
        next: (response) => {
            console.log('Weight data added successfully:', response);
        },
        error: (error) => {
            // Handle the error in the subscription if needed
            console.error('Subscription error:', error);
        }
    });
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

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onClickadd(){
    this.noWdata = 'add';
  }
  onClickcancel(){
    this.noWdata = 'data';
    this.weightData.reset();
  }


}
