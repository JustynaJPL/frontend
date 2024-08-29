import { MyData } from "./../../../models/MyData";
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
import { BaseChartDirective } from "ng2-charts";
import { ChartDataset, ChartOptions } from "chart.js";
import { MatButtonModule } from "@angular/material/button";
import { BmicalcComponent } from "../bmicalc/bmicalc.component";
import { BmrcalcComponent } from "../bmrcalc/bmrcalc.component";

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
        MatButtonModule,
        BmicalcComponent,
        BmrcalcComponent
    ]
})
export class MyDataComponent {
  genders: string[] = [];
  sport: string[] = [];
  userData!: FormGroup;
  mydataisedited: boolean = false;
  avatarPreview: string | ArrayBuffer | null = null;
  originalUserData: any;
  formData = new FormData();
  avatarchanged: boolean = false;

  constructor(
    private dbservice: DatabaseConnectorService,
    private loger: LoggerService
  ) {
    this.userData = new FormGroup({
      id: new FormControl({ value: 0, disabled: true }),
      name: new FormControl({ value: "", disabled: true }),
      email: new FormControl({ value: "", disabled: true }),
      gender: new FormControl({ value: "", disabled: true }),
      height: new FormControl({ value: 0, disabled: true }),
      birth: new FormControl({ value: "", disabled: true }),
      sport: new FormControl({ value: "", disabled: true }),
      avatar: new FormControl({ value: "", disabled: true }),
      age: new FormControl({ value: 0, disabled: true }),
      avatarid: new FormControl({ value: 0, disabled: true }),
    });
  }

  ngOnInit() {
    this.loger.getMyData().subscribe((response: any) => {
      const formattedBirthDate = this.formatDate(response.birth);

      this.userData.patchValue({
        id: response.id,
        name: response.name,
        email: response.email,
        gender: response.gender,
        height: response.height,
        birth: formattedBirthDate,
        sport: response.sport,
        avatar: this.loger.api + response.avatar,
        avatarid: response.avatarid,
      });
      this.originalUserData = { ...this.userData.value };

      this.userData.disable();
      console.log(response);
    });

    this.loger.getgenders().subscribe((response: any) => {
      this.genders = response.gender;
      // console.log(this.genders);
    });

    this.loger.getsport().subscribe((response: any) => {
      this.sport = response.sport;
      // console.log(response);
    });
  }

  onSubmit() {
    const newuserdata: MyData = {
      id: this.userData.get("id")?.value,
      name: this.userData.get("name")?.value,
      email: this.userData.get("email")?.value,
      gender: this.userData.get("gender")?.value,
      height: this.userData.get("height")?.value,
      birth: this.userData.get("birth")?.value,
      sport: this.userData.get("sport")?.value,
      avatar: "",
      avatarid: this.userData.get("avatarid")?.value,
    };
    this.toggleEditing("done");

    if (this.avatarchanged) {
      this.dbservice
        .uploadFileToDB(this.formData)
        .subscribe((response: any) => {
          console.log(response[0].id);
          newuserdata.avatarid =  response[0].id;
          console.log(newuserdata);

          this.loger.updateMyData(newuserdata).subscribe((response) => {
            console.log(response);
          });
        });
    } else {
      this.loger.updateMyData(newuserdata).subscribe((response) => {
        console.log(response);
      });
    }
  }

  toggleEditing(call: string) {
    this.mydataisedited = !this.mydataisedited;
    if (call == "edit") this.userData.enable();
    if (call == "back") {
      this.userData.disable();
      this.userData.patchValue(this.originalUserData);
      this.avatarchanged = false;
    }
    if (call == "done") this.userData.disable();
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

  getAge(): number {
    var age = 0;
    if (this.userData.get("birth")?.value) {
      const today = new Date();
      const birth = new Date(this.userData.get("birth")?.value);
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

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      this.formData.append("files", file);
      this.avatarchanged = true;
      reader.onload = () => {
        this.avatarPreview = reader.result;
        // Możesz tutaj ustawić nową wartość avatara, aby była przesłana na serwer
        this.userData.patchValue({ avatar: this.avatarPreview });
      };
      reader.readAsDataURL(file);
    }
  }

}
