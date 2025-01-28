import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GeneratePlanService {
  private formDataSubject = new BehaviorSubject<FormGroup | null>(null);
  formData$ = this.formDataSubject.asObservable();

  constructor() {}

  updateFormData(data: any) {
    this.formDataSubject.next(new FormGroup({
      kcal: new FormControl(data.kcal),
      bialka: new FormControl(data.bialka),
      weglowodany: new FormControl(data.weglowodany),
      tluszcze: new FormControl(data.tluszcze),
      datapoczatkowa: new FormControl(data.datapoczatkowa),
    }));
  }

  getFormData(): FormGroup {
    return this.formDataSubject.value || new FormGroup({});
  }
}
