import { MatFormFieldModule } from "@angular/material/form-field";
import { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { DatabaseConnectorService } from "../../../database-services/database-connector.service";
import { LoggerService } from "../../../login/logger.service";
import { response } from "express";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { DefaultSettingsComponent } from "../default-settings/default-settings.component";
import { WeightDataComponent } from "../weight-data/weight-data.component";
import { MatSelectModule } from "@angular/material/select";
import { GDA } from "../../../models/GDA";

@Component({
  selector: "app-my-data",
  standalone: true,
  templateUrl: "./my-data.component.html",
  styleUrl: "./my-data.component.sass",
  imports: [
    CommonModule,
    AppNaviComponent,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    DefaultSettingsComponent,
    WeightDataComponent,
    MatFormFieldModule,
    MatSelectModule,
  ],
})
export class MyDataComponent {
  genders: string[] = [];
  sport: string[] = [];
  userData!: FormGroup;
  mydataisedited: boolean = false;
  myGDA!:FormGroup;
  id!:number;

  constructor(
    private dbservice: DatabaseConnectorService,
    private loger: LoggerService
  ) {
    this.userData = new FormGroup({
      name: new FormControl({ value: "", disabled: true }),
      email: new FormControl({ value: "", disabled: true }),
      gender: new FormControl({ value: "", disabled: true }),
      height: new FormControl({ value: 0, disabled: true }),
      birth: new FormControl({ value: "", disabled: true }),
      sport: new FormControl({ value: "", disabled: true }),
      avatar: new FormControl({ value: "", disabled: true }),
    });

    this.myGDA = new FormGroup({
      kcal: new FormControl(0),
      bialka: new FormControl(0),
      tluszcze:new FormControl(0),
      weglowodany: new FormControl(0)
    });


  }

  ngOnInit() {
    this.loger.getMyData().subscribe((response: any) => {
      // this.loger.getMyData().subscribe((response: any) => {
        // Convert the Date object to a string format 'yyyy-MM-dd'
        this.id = response.id;
        const formattedBirthDate = this.formatDate(response.birth);

        // Enable the 'birth' control if it was initially disabled
        this.userData.get('birth')?.enable();

        // Patch the values including the formatted birth date
        this.userData.patchValue({
          name: response.name,
          email: response.email,
          gender: response.gender,
          height: response.height,
          birth: formattedBirthDate, // Use the formatted date
          sport: response.sport,
          avatar: this.loger.api + response.avatar
        });
        // Disable the 'birth' control after patching
        this.userData.get('birth')?.disable();

        console.log(this.userData.value);
      });

    this.loger.getGda(this.id).subscribe((response) => {
     this.myGDA.patchValue({
      kcal:response.kcal,
      bialka:response.bialka,
      weglowodany:response.weglowodany,
      tluszcze:response.tluszcze,
     })
    })

    this.loger.getgenders().subscribe((response: string[]) => {
      this.genders = response;
    });

    this.loger.getsport().subscribe((response: string[]) => {
      this.sport = response;
    });
  }

  onSubmit() {
    this.toggleEditing();
  }

  toggleEditing() {
    this.mydataisedited = !this.mydataisedited;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
}
