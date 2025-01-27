import { Validators } from "@angular/forms";
import { FormControl, FormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule, Location } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { LoggerService } from "../../../login/logger.service";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { BmrcalcComponent } from "../../user-data/bmrcalc/bmrcalc.component";
import { MatInputModule } from "@angular/material/input";
import { DefaultSettingsComponent } from "../../user-data/default-settings/default-settings.component";
import { MatCardModule } from "@angular/material/card";
import { CpmComponent } from "../cpm/cpm.component";
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

@Component({
  selector: "app-goals",
  standalone: true,
  templateUrl: "./goals.component.html",
  styleUrl: "./goals.component.sass",
  imports: [
    AppNaviComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BmrcalcComponent,
    MatSelectModule,
    MatInputModule,
    DefaultSettingsComponent,
    MatCardModule,
    CpmComponent,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class GoalsComponent {
  sport: string[] = [];
  userData!: FormGroup;
  generateData!: FormGroup;

  constructor(private location: Location, private loger: LoggerService) {
    this.userData = new FormGroup({
      id: new FormControl({ value: 0, disabled: true }),
      name: new FormControl({ value: "", disabled: true }),
      email: new FormControl({ value: "", disabled: true }),
      gender: new FormControl({ value: "", disabled: true }),
      height: new FormControl({ value: 0, disabled: true }),
      birth: new FormControl({ value: "", disabled: true }),
      sport: new FormControl({ value: "", disabled: true }),
      age: new FormControl({ value: 0, disabled: true }),
    });

    this.generateData = new FormGroup({
      id: new FormControl(0, [Validators.required]),
      kcal: new FormControl(0, [Validators.required]),
      bialka: new FormControl(0, [Validators.required]),
      weglowodany: new FormControl(0, [Validators.required]),
      tluszcze: new FormControl(0, [Validators.required]),
      datapoczatkowa: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.loger.getsport().subscribe({
      next: (response: any) => {
        this.sport = response?.sport || [];
      },
      error: (err) => console.error("Failed to fetch sports data:", err),
    });

    this.loger.getMyData().subscribe((response) => {
      this.userData.patchValue(response);
      console.log(this.userData.value);
    });
  }

  goBack(): void {
    this.location.back();
  }

  submitData() {}

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  onDateChange($event: MatDatepickerInputEvent<any, any>) {
    const date: string = this.formatDate($event.target.value);
    this.generateData.get("datapoczatkowa")?.setValue(date);
  }

  resetData() {
    this.generateData.reset();
  }
}
