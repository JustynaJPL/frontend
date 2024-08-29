import { CommonModule } from '@angular/common';
import { MyData } from './../../../models/MyData';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LoggerService } from '../../../login/logger.service';
import { WeightData } from '../../../models/OdczytWagi';
import { response } from 'express';
import { catchError, throwError } from 'rxjs';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-bmicalc',
  standalone: true,
  imports: [CommonModule,MatCardModule, MatProgressBarModule ],
  templateUrl: './bmicalc.component.html',
  styleUrl: './bmicalc.component.sass'
})
export class BmicalcComponent {
  pomiary:WeightData[] = [];
  uid:number;
  uheight:number;
  noweightvalues:boolean;

  constructor(private loger:LoggerService){
    this.uid = 0;
    this.uheight = 0;
    this.noweightvalues = false;

  }

  ngOnInit(){
    this.loger.getUserDBID().pipe(
      catchError((error) => {
          console.error('Error fetching user DB ID:', error);
          return throwError(() => new Error('Failed to retrieve user ID. Please try again later.'));
      })
  ).subscribe({
      next: (response) => {
          this.uid = response;

          this.loger.getWeightDataOfUserWithID(this.uid).pipe(
              catchError((error) => {
                  console.error('Error fetching weight data for user:', error);
                  return throwError(() => new Error('Failed to retrieve weight data. Please try again later.'));
              })
          ).subscribe({
              next: (response: WeightData[]) => {
                  this.pomiary = response;
                  if (response.length == 0) {
                    this.noweightvalues = true;
                  }
              },
              error: (error) => {
                  console.error('Subscription error while fetching weight data:', error);
                  // Optionally, handle the error here, like showing a user-friendly message
              }
          });
      },
      error: (error) => {
          console.error('Subscription error while fetching user DB ID:', error);
          // Optionally, handle the error here, like showing a user-friendly message
      }
  });

  this.loger.getMyData().subscribe((response:MyData)=>{
    this.uheight = response.height;
  })

  }

  getObese(): string {
    if (this.getBMI() < 16) return "III stopień szczupłości";
    if (this.getBMI() > 16 && this.getBMI() <= 16.9)
      return "II stopień szczupłości";
    if (this.getBMI() > 16.9 && this.getBMI() <= 18.4)
      return "I stopień szczupłości";
    if (this.getBMI() > 18.4 && this.getBMI() <= 24.9) return "Norma";
    if (this.getBMI() > 24.9 && this.getBMI() <= 29.9) return "Nadwaga";
    if (this.getBMI() > 29.9 && this.getBMI() <= 34.9)
      return "I stopień otyłości";
    if (this.getBMI() > 34.9 && this.getBMI() <= 39.9)
      return "II stopień otyłości";
    if (this.getBMI() > 39.9) return "III stopień otyłości";
    else {
      return "Błąd";
    }
  }

  getBMI(): number {
    this.pomiary
      .sort((a, b) => {
        return a.wdate.getTime() - b.wdate.getTime();
    });

    let bmi:number  =
      this.pomiary.slice(-1)[0].wv /
      (((this.uheight / 100) * this.uheight) / 100);
    return bmi;
  }

  getprogressvalue(): number {
    let val = this.getBMI();
    return (val / 50) * 100;
  }

}
