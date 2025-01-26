import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { LoggerService } from "../../../login/logger.service";
import { MyData } from "../../../models/MyData";
import { WeightData } from "../../../models/OdczytWagi";
import { error } from "console";

@Component({
  selector: "app-bmrcalc",
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: "./bmrcalc.component.html",
  styleUrl: "./bmrcalc.component.sass",
})
export class BmrcalcComponent {
  dataavailable: boolean;
  userbmrvalues: any;
  uid: number;
  pomiary: WeightData[] = [];

  constructor(private loger: LoggerService) {
    this.dataavailable = false;
    this.uid = 0;
  }

  ngOnInit() {
    this.loger.getMyData().subscribe(
      (response: MyData) => {
        this.userbmrvalues = {
          height: response.height,
          weight: 0,
          age: this.getAge(response.birth),
          gender: response.gender,
        };

        this.loger.getUserDBID().subscribe(
          (response: number) => {
            this.uid = response;

            this.loger.getWeightDataOfUserWithID(this.uid).subscribe(
              (response: WeightData[]) => {
                if (response.length === 0) {
                  console.warn("No weight data available for user.");
                } else {
                  this.dataavailable = true;
                  this.pomiary = response;
                  this.pomiary.sort((a, b) => {
                    return a.wdate.getTime() - b.wdate.getTime();
                  });
                  this.userbmrvalues.weight = this.pomiary.slice(-1)[0].wv;
                  console.log(this.userbmrvalues);
                }
              },
              (error) => {
                console.error("Error fetching weight data:", error);
              }
            );
          },
          (error) => {
            console.error("Error fetching user DB ID:", error);
          }
        );
      },
      (error) => {
        console.error("Error fetching user data:", error);
      }
    );
  }

  getAge(birth: Date): number {
    var age = 0;
    if (birth) {
      const today = new Date();
      const diff = today.getFullYear() - birth.getFullYear();

      // Check if the birthday has occurred this year
      if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() < birth.getDate())
      ) {
        age = diff - 1;
      } else {
        age = diff;
      }
    }
    return age;
  }

  getBMR(): number {
    let swe: number = 0;

    if (this.userbmrvalues.gender === "mężczyzna") {
      swe =
        66.5 +
        13.75 * this.userbmrvalues.weight +
        5.003 * this.userbmrvalues.height -
        6.775 * this.userbmrvalues.age;
    } else if (this.userbmrvalues.gender === "kobieta") {
      swe =
        655.1 +
        9.563 * this.userbmrvalues.weight +
        1.85 * this.userbmrvalues.height -
        4.676 * this.userbmrvalues.age;
    }

    localStorage.setItem('ppm',swe.toFixed(2));
    console.log(localStorage.getItem('ppm'));

    // Zwracamy wartość zaokrągloną do dwóch miejsc po przecinku
    return parseFloat(swe.toFixed(0));
  }

}
