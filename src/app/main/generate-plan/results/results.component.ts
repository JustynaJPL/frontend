import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GeneratePlanService } from '../generate-plan.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateModule } from '@angular/material/core';

@Component({
    selector: 'app-results',
    standalone: true,
    templateUrl: './results.component.html',
    styleUrl: './results.component.sass',
    imports: [
      AppNaviComponent,
      CommonModule,
      MatCardModule,
      MatButtonModule,
      MatInputModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatIconModule,
      MatDatepickerModule,
      MatNativeDateModule,
    ]
})
export class ResultsComponent {
  generateData: FormGroup;

  constructor(
    private genService:GeneratePlanService,
    private fb:FormBuilder,
    private location:Location
  ){
    this.generateData = fb.group({
      kcal: [0],
      bialka: [0],
      weglowodany: [0],
      tluszcze: [0],
      datapoczatkowa:['']
    });



  }

  ngOnInit() {
    this.genService.formData$.subscribe(formData => {
      if (formData) {
        this.generateData.patchValue(formData.value);
      }
    });

  }

  cancel(){
    this.location.back();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

}
