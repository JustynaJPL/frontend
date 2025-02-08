import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, delay, switchMap } from "rxjs";
import { PosilekMinimal } from "../../models/PosilekMinimal";
import { DatabaseConnectorService } from "../../database-services/database-connector.service";
import { Przepis } from "../../models/Przepis";
import { response } from "express";
import { PrzepisGeneracja } from "../../models/PrzepisGeneracja";
import { DBResults } from "../../models/DBResults";

@Injectable({
  providedIn: "root",
})
export class GeneratePlanService {
  private formDataSubject = new BehaviorSubject<FormGroup | null>(null);
  formData$ = this.formDataSubject.asObservable();
  recipes!: PrzepisGeneracja[];
  results: DBResults[] = [];
  przepisK1: { id: number; kcal: number }[] = [];
  przepisK2: { id: number; kcal: number }[] = [];
  przepisK3: { id: number; kcal: number }[] = [];
  przepisK4: { id: number; kcal: number }[] = [];
  userKcalValue:number = 0;



  constructor(private db: DatabaseConnectorService) {}

  updateFormData(data: any) {
    this.formDataSubject.next(
      new FormGroup({
        kcal: new FormControl(data.kcal),
        bialka: new FormControl(data.bialka),
        weglowodany: new FormControl(data.weglowodany),
        tluszcze: new FormControl(data.tluszcze),
        datapoczatkowa: new FormControl(data.datapoczatkowa),
      })
    );
  }

  getFormData(): FormGroup {
    return this.formDataSubject.value || new FormGroup({});
  }

  generatePlan(kcal: number): any {
    // PosilekMinimal[][]
    this.userKcalValue = kcal;
    this.getDataFromDB();
  }

  getDataFromDB() {
    this.db.getRecipestoGenerate().subscribe(
      (response) => {
        this.recipes = response;
        console.log("Przepisy:", this.recipes);

        // Sortowanie przepisów po kategorii
        this.sortRecipes();
      },
      (error) => {
        console.error("Błąd podczas pobierania przepisów:", error);
      }
    );
  }

  private sortRecipes() {
    this.recipes.forEach((recipe) => {
      switch (recipe.idKategorii) {
        case 1:
          this.przepisK1.push({ id: recipe.idPrzepisu, kcal: recipe.kcal });
          break;
        case 2:
          this.przepisK2.push({ id: recipe.idPrzepisu, kcal: recipe.kcal });
          break;
        case 3:
          this.przepisK3.push({ id: recipe.idPrzepisu, kcal: recipe.kcal });
          break;
        case 4:
          this.przepisK4.push({ id: recipe.idPrzepisu, kcal: recipe.kcal });
          break;
        default:
          console.error("Nieznana kategoria:", recipe.idKategorii);
      }
    });

    console.log("k1:", this.przepisK1);
    console.log("k2:", this.przepisK2);
    console.log("k3:", this.przepisK3);
    console.log("k4:", this.przepisK4);

    this.generateResults();
  }

  private generateResults() {
    for (let i = 0; i < this.przepisK1.length; i++) {
      for (let j = 0; j < this.przepisK2.length; j++) {
        for (let k = 0; k < this.przepisK3.length; k++) {
          for (let l = 0; l < this.przepisK4.length; l++) {
            this.results.push({
              recipesIds: [
                this.przepisK1[i].id,
                this.przepisK2[j].id,
                this.przepisK3[k].id,
                this.przepisK4[l].id,
              ],
              sum: this.przepisK1[i].kcal +
                this.przepisK2[j].kcal +
                this.przepisK3[k].kcal +
                this.przepisK4[l].kcal,
              fit: 0,
            });
          }
        }
      }
    }
    console.log('Rezultat: ', this.results);
    this.countFit();
  }

  private countFit(){
    const userKcalValue =  this.userKcalValue;
    if(userKcalValue==0)
    {
      console.log("Dane użytkownika nie podane!")
    }
    else{
      for (let i = 0; i < this.results.length; i++) {
      this.results[i].fit = Math.abs(this.results[i].sum - userKcalValue)
    }
    this.sortResults();
  }
  }
  
  private sortResults(){
    this.results.sort((a, b) => a.fit - b.fit);
  }
}
