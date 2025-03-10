import { DBResults } from "./../../models/DBResults";
import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { DatabaseConnectorService } from "../database-connector.service";
import { PrzepisGeneracja } from "../../models/PrzepisGeneracja";
import { WygenerowanyPlan } from "../../models/WygenerowanyPlan";
import { stat } from "node:fs/promises";

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
  statistic: { kno: number, kcal100: number, kcal200: number, kcal300: number, kcal400: number, kcal500: number, kcal600: number, kcal700: number, kcal800: number, kcal900: number, kcal1000: number }[] = [
    { kno: 1, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 },
    { kno: 2, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 },
    { kno: 3, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 },
    { kno: 4, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 }
  ];

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
    const kcal = formData.get("kcal")?.value;
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

    this.statistic = [
      { kno: 1, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 },
      { kno: 2, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 },
      { kno: 3, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 },
      { kno: 4, kcal100: 0, kcal200: 0, kcal300: 0, kcal400: 0, kcal500: 0, kcal600: 0, kcal700: 0, kcal800: 0, kcal900: 0, kcal1000: 0 }
    ];

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
      this.statisticAnalize(recipe.idKategorii, recipe.kcal);
    });
    this.showStatistics();

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
    // let randomPicks: Set<number> = new Set();
    const maxIndex = this.results.findIndex(
      (result) => result.fit >= 45 && result.fit <= 55
    );
    if (maxIndex === -1) {
      console.error("No result found with fit value between 45 and 55");
      return;
    } else {
      console.log("Indeks fit=50 : ", maxIndex);
    }

    this.wybraneR = [];
    // this.wybraneR.push(this.results[this.getRandomInt(0, maxIndex)]);
    this.wybraneR.push(this.results[0]);
    let r=1;

    genloop:while (this.wybraneR.length < 7) {
      // randomPicks.add(this.getRandomInt(0, maxIndex));
      // let r = this.getRandomInt(0, maxIndex);
      let newValue: number[] = this.results[r].recipesIds;
      let duplicates = false;
      checkloop: for (let i = 0; i < this.wybraneR.length; i++) {
        for (let j = 0; j < this.wybraneR[i].recipesIds.length; j++) {
          let alreadyused = this.wybraneR[i].recipesIds[j];
          for (let k = 0; k < newValue.length; k++) {
            if (newValue[k] == alreadyused) {
              duplicates = true;
              break checkloop;
            }
          }
        }
      }
      if (!duplicates) {
        this.wybraneR.push(this.results[r]); // Dodaj do tablicy tylko jeśli nie było duplikatu
      }
      r++;
      if(r==maxIndex){
        console.log('Osiągnięto limit maxIndex');
        break genloop;
      }
    }

    // console.log("Wybrane numery ", Array.from(randomPicks));

    // randomPicks.forEach((pick) => {
    //   // console.log(`Rezultat: ${pick} : `, this.results[pick]);
    //   this.wybraneR.push(this.results[pick]);
    // });
    // // console.log("Wyniki: ", this.wybraneR);

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
    console.log("Plan: ", plan);
    this.resultsFinal.next(plan);
  }

  // Statystyka
  statisticAnalize(idKategorii: number, kcal: number) {
    switch (idKategorii) {
      case 1:
        if (kcal >= 100 && kcal < 200) {
          this.statistic[0].kcal100++;
        } else if (kcal >= 200 && kcal < 300) {
          this.statistic[0].kcal200++;
        } else if (kcal >= 300 && kcal < 400) {
          this.statistic[0].kcal300++;
        } else if (kcal >= 400 && kcal < 500) {
          this.statistic[0].kcal400++;
        } else if (kcal >= 500 && kcal < 600) {
          this.statistic[0].kcal500++;
        } else if (kcal >= 600 && kcal < 700) {
          this.statistic[0].kcal600++;
        } else if (kcal >= 700 && kcal < 800) {
          this.statistic[0].kcal700++;
        } else if (kcal >= 800 && kcal < 900) {
          this.statistic[0].kcal800++;
        } else if (kcal >= 900 && kcal < 1000) {
          this.statistic[0].kcal900++;
        } else if (kcal >= 1000) {
          this.statistic[0].kcal1000++;
        }
        break;
      case 2:
        if (kcal >= 100 && kcal < 200) {
          this.statistic[1].kcal100++;
        } else if (kcal >= 200 && kcal < 300) {
          this.statistic[1].kcal200++;
        } else if (kcal >= 300 && kcal < 400) {
          this.statistic[1].kcal300++;
        } else if (kcal >= 400 && kcal < 500) {
          this.statistic[1].kcal400++;
        } else if (kcal >= 500 && kcal < 600) {
          this.statistic[1].kcal500++;
        } else if (kcal >= 600 && kcal < 700) {
          this.statistic[1].kcal600++;
        } else if (kcal >= 700 && kcal < 800) {
          this.statistic[1].kcal700++;
        } else if (kcal >= 800 && kcal < 900) {
          this.statistic[1].kcal800++;
        } else if (kcal >= 900 && kcal < 1000) {
          this.statistic[1].kcal900++;
        } else if (kcal >= 1000) {
          this.statistic[1].kcal1000++;
        }
        break;
        case 3:
        if (kcal >= 100 && kcal < 200) {
          this.statistic[2].kcal100++;
        } else if (kcal >= 200 && kcal < 300) {
          this.statistic[2].kcal200++;
        } else if (kcal >= 300 && kcal < 400) {
          this.statistic[2].kcal300++;
        } else if (kcal >= 400 && kcal < 500) {
          this.statistic[2].kcal400++;
        } else if (kcal >= 500 && kcal < 600) {
          this.statistic[2].kcal500++;
        } else if (kcal >= 600 && kcal < 700) {
          this.statistic[2].kcal600++;
        } else if (kcal >= 700 && kcal < 800) {
          this.statistic[2].kcal700++;
        } else if (kcal >= 800 && kcal < 900) {
          this.statistic[2].kcal800++;
        } else if (kcal >= 900 && kcal < 1000) {
          this.statistic[2].kcal900++;
        } else if (kcal >= 1000) {
          this.statistic[2].kcal1000++;
        }
        break;
        case 4:
        if (kcal >= 100 && kcal < 200) {
          this.statistic[3].kcal100++;
        } else if (kcal >= 200 && kcal < 300) {
          this.statistic[3].kcal200++;
        } else if (kcal >= 300 && kcal < 400) {
          this.statistic[3].kcal300++;
        } else if (kcal >= 400 && kcal < 500) {
          this.statistic[3].kcal400++;
        } else if (kcal >= 500 && kcal < 600) {
          this.statistic[3].kcal500++;
        } else if (kcal >= 600 && kcal < 700) {
          this.statistic[3].kcal600++;
        } else if (kcal >= 700 && kcal < 800) {
          this.statistic[3].kcal700++;
        } else if (kcal >= 800 && kcal < 900) {
          this.statistic[3].kcal800++;
        } else if (kcal >= 900 && kcal < 1000) {
          this.statistic[3].kcal900++;
        } else if (kcal >= 1000) {
          this.statistic[3].kcal1000++;
        }
        break;
      default:
        console.error("Nieznana kategoria:", idKategorii);
      }
  }
  showStatistics() {
    console.log('Statystyka: ', this.statistic);
  }

}
