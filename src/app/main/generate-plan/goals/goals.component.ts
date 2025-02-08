import { GeneratePlanService } from './../generate-plan.service';
import { FormBuilder, Validators } from "@angular/forms";
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
import { ActivatedRoute, Router } from "@angular/router";

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

  constructor(
    private location: Location,
    private loger: LoggerService,
    private fb: FormBuilder,
    private router:Router,
    private route: ActivatedRoute,
    private genPlan:GeneratePlanService
  ) {
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

    this.generateData = this.fb.group(
      {
        kcal: [
          "",
          [Validators.required, Validators.min(1200), Validators.max(4000)],
        ],
        datapoczatkowa: ["", [Validators.required]],
      }
      // { validator: this.checkPercentages }
    );
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

  // checkPercentages(group: FormGroup) {
  //   const bialka = group.get("bialka")!.value;
  //   const weglowodany = group.get("weglowodany")!.value;
  //   const tluszcze = group.get("tluszcze")!.value;
  //   const total = +bialka + +weglowodany + +tluszcze;
  //   return total === 100 ? null : { not100Percent: true };
  // }

  goBack(): void {
    this.location.back();
  }

  submitData() {
    if (this.generateData.valid) {
      console.log(this.generateData.value);
      this.genPlan.updateFormData(this.generateData.value);
      this.router.navigate(['../results'], { relativeTo: this.route });
    } else {
      console.log("Form is not valid");
    }
  }

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

  handleInput(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      charCode > 31 &&
      (charCode < 48 || charCode > 57) && // Not a number from the main keyboard
      (charCode < 96 || charCode > 105) // Not a number from the numeric keypad
    ) {
      event.preventDefault();
    }
  }
}
