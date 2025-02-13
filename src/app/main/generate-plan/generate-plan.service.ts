import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { DatabaseConnectorService } from "../database-connector.service";
import { PrzepisGeneracja } from "../../models/PrzepisGeneracja";
import { DBResults } from "../../models/DBResults";
import { WygenerowanyPlan } from "../../models/WygenerowanyPlan";

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
  userKcalValue: number = 0;
  private resultsFinal = new BehaviorSubject<WygenerowanyPlan>({
    dni: [],
    kcalPerDay: [],
  });
  results$ = this.resultsFinal.asObservable();

  wybraneR: DBResults[] = [];

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
    const formData = this.getFormData();
    const kcal = formData.get('kcal')?.value;
    if (kcal) {
      this.generatePlan(kcal);
    }
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

    this.przepisK1 = [];
    this.przepisK2 = [];
    this.przepisK3 = [];
    this.przepisK4 = [];


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

    // console.log("k1:", this.przepisK1);
    // console.log("k2:", this.przepisK2);
    // console.log("k3:", this.przepisK3);
    // console.log("k4:", this.przepisK4);

    this.generateResults();
  }

  private generateResults() {

    this.results = [];

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
              sum:
                this.przepisK1[i].kcal +
                this.przepisK2[j].kcal +
                this.przepisK3[k].kcal +
                this.przepisK4[l].kcal,
              fit: 0,
            });
          }
        }
      }
    }
    console.log("Rezultat: ", this.results);
    this.countFit();
  }

  private countFit() {
    const userKcalValue = this.userKcalValue;
    if (userKcalValue == 0) {
      console.log("Dane użytkownika nie podane!");
    } else {
      for (let i = 0; i < this.results.length; i++) {
        this.results[i].fit = Math.abs(this.results[i].sum - userKcalValue);
      }
      this.sortResults();
    }
  }

  private sortResults() {
    this.results.sort((a, b) => a.fit - b.fit);
    this.chooseRandom();
  }

  private chooseRandom() {
    let randomPicks: Set<number> = new Set();
    const maxIndex = this.results.findIndex(
      (result) => result.fit >= 45 && result.fit <= 55
    );
    if (maxIndex === -1) {
      console.error("No result found with fit value between 45 and 55");
      return;
    } else {
      console.log("Indeks fit=50 : ", maxIndex);
    }

    while (randomPicks.size < 7) {
      randomPicks.add(this.getRandomInt(0, maxIndex));
    }

    // console.log("Wybrane numery ", Array.from(randomPicks));
    this.wybraneR=[];
    randomPicks.forEach((pick) => {
      // console.log(`Rezultat: ${pick} : `, this.results[pick]);
      this.wybraneR.push(this.results[pick]);
    });
    // console.log("Wyniki: ", this.wybraneR);
    this.returnPlantoUser();
  }

  returnPlantoUser() {
    let plan: WygenerowanyPlan = { dni: [], kcalPerDay: [] };
    this.wybraneR.forEach((elem: DBResults) => {
      let dzien: any[] = [];
      elem.recipesIds.forEach((id: number) => {
        const foundRecipe = this.recipes.find(
          (recipe) => recipe.idPrzepisu === id
        );
        if (foundRecipe) {
          dzien.push(foundRecipe);
        } else {
          console.error(`Recipe with id ${id} not found`);
        }
      });
      plan.dni.push([dzien]);
      plan.kcalPerDay.push(elem.sum);
    });
    // console.log("Plan: ", plan);
    this.resultsFinal.next(plan);
  }

  private getRandomInt(min: number, max: number): number {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return min + (randomBuffer[0] % (max - min + 1));
  }

}
