import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Kategoria } from "../../../models/Kategoria";
import { Produkt } from "../../../models/Produkt";
import { ActivatedRoute } from "@angular/router";
import { DatabaseConnectorService } from "../../../database-services/database-connector.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Przepis } from "../../../models/Przepis";
import { Skladnik } from "../../../models/Skladnik";
import { switchMap } from "rxjs/internal/operators/switchMap";
import {
  MatError,
  MatOption,
  MatSelectChange,
  MatSelectModule,
} from "@angular/material/select";
import { Location } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { TextFieldModule } from "@angular/cdk/text-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { concatMap, of, Subscription } from "rxjs";
import { url } from "inspector";

@Component({
  selector: "app-view-recipe",
  standalone: true,
  templateUrl: "./view-recipe.component.html",
  styleUrl: "./view-recipe.component.sass",
  imports: [
    CommonModule,
    AppNaviComponent,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatError,
    MatFormFieldModule,
    MatLabel,
    MatOption,
    MatSelectModule,
    TextFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class ViewRecipeComponent {
  recipeForm!: FormGroup;
  private routeSub: Subscription | null = null;
  id: number | null = null;
  przepis!: Przepis;
  imageUrl: string | ArrayBuffer | null = null;
  kategorie: Kategoria[] = [];
  produkty: Produkt[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private dbservice: DatabaseConnectorService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((paramMap) => {
      const idParam = paramMap.get("id");
      this.id = idParam !== null ? Number(idParam) : null;
      if (this.id !== null && isNaN(this.id)) {
        console.error("Invalid id parameter:", idParam);
      } else {
        console.log(this.id); // Check if the id is correctly retrieved and converted
      }
    });

    this.dbservice.getRecipeWithId(this.id!).subscribe((recipe: Przepis) => {
      this.przepis = recipe;
      // console.log(recipe);
      console.log(this.przepis);

      this.imageUrl = this.dbservice.APIURL + this.przepis.imageurl;

      this.recipeForm = this.formBuilder.group({
        nazwaPrzepisu: [{ value: this.przepis.nazwaPrzepisu, disabled: true }],
        image: [
          {
            value: this.dbservice.APIURL + this.przepis.imageurl,
            disabled: true,
          },
        ], // Zakładamy, że "obraz" to będzie plik, więc początkowo null
        kategoria: this.formBuilder.group({
          nazwa: [{ value: this.przepis.kategoria.nazwa, disabled: true }],
        }),
        skladniki: this.formBuilder.array([]), // Początkowo pusta lista skladników
        instrukcje: this.formBuilder.array([
          { value: this.przepis.instrukcja1, disabled: true },
          {
            value: this.przepis.instrukcja2 ? this.przepis.instrukcja2 : "",
            disabled: true,
          },
          {
            value: this.przepis.instrukcja3 ? this.przepis.instrukcja3 : "",
            disabled: true,
          },
          {
            value: this.przepis.instrukcja4 ? this.przepis.instrukcja4 : "",
            disabled: true,
          },
          {
            value: this.przepis.instrukcja5 ? this.przepis.instrukcja5 : "",
            disabled: true,
          },
          {
            value: this.przepis.instrukcja6 ? this.przepis.instrukcja6 : "",
            disabled: true,
          },
        ]),
        kcal: [{ value: this.przepis.gda.kcal, disabled: true }],
        bialko: [{ value: this.przepis.gda.bialka, disabled: true }],
        weglowodany: [{ value: this.przepis.gda.weglowodany, disabled: true }],
        tluszcze: [{ value: this.przepis.gda.tluszcze, disabled: true }],
        searchTerm: [""],
        liczbaporcji: { value: this.przepis.liczbaporcji, disabled: true },
      });
    });

    this.dbservice.getKategorie().subscribe(
      (_kategorie) => {
        this.kategorie = _kategorie;
      },
      (error) => {
        console.log("Wystąpił błąd podczas pobierania kategorii", error);
      }
    );

    this.dbservice.getAllProdukts().subscribe(
      (produkty: Produkt[]) => {
        this.produkty = produkty;
      },
      (error) => {
        console.log("Wystąpił błąd podczas pobierania produktów", error);
      }
    );

    this.dbservice
      .getSkladniksofRecipeWithId(this.id!)
      .subscribe((skladniki: Skladnik[]) => {
        const skladnikiFormArray = this.recipeForm.get(
          "skladniki"
        ) as FormArray;

        console.log(skladniki);

        skladniki.forEach((skladnik) => {
          const skladnikGroup = this.formBuilder.group({
            id: [{ value: skladnik.id, disabled: true }],
            ilosc: [
              { value: skladnik.ilosc, disabled: true },
              Validators.required,
            ],
            nazwa: [
              { value: skladnik.nazwaProduktu, disabled: true },
              Validators.required,
            ],
            kcal: [{ value: skladnik.kcal, disabled: true }],
            tluszcze: [{ value: skladnik.tluszcze, disabled: true }],
            weglowodany: [{ value: skladnik.weglowodany, disabled: true }],
            bialko: [{ value: skladnik.bialko, disabled: true }],
            kcalperw: [{ value: skladnik.kcalperw, disabled: true }],
            tluszczeperw: [{ value: skladnik.tluszczeperw, disabled: true }],
            weglowodanyperw: [
              { value: skladnik.weglowodanyperw, disabled: true },
            ],
            bialkoperw: [{ value: skladnik.bialkoperw, disabled: true }],
          });
          skladnikiFormArray.push(skladnikGroup);
        });
      });

    this.wyliczmakrodlaprzepisu();

    this.recipeForm.get("kategoria.nazwa")?.disable();
  }

  get searchTermControl(): FormControl {
    return this.recipeForm.get("searchTerm") as FormControl;
  }

  get skladniki() {
    return this.recipeForm.get("skladniki") as FormArray;
  }

  get instrukcje(): FormArray {
    return this.recipeForm.get("instrukcje") as FormArray;
  }

  makecalculations(iter: number) {
    const skladniki = this.recipeForm.get("skladniki") as FormArray;
    const skladnik = skladniki.at(iter) as FormGroup;

    if (skladnik) {
      // Przykład obliczeń dla jednego składnika
      const ilosc = skladnik.get("ilosc")?.value || 0;
      const kcal = skladnik.get("kcal")?.value || 0;
      const bialko = skladnik.get("bialko")?.value || 0;
      const weglowodany = skladnik.get("weglowodany")?.value || 0;
      const tluszcze = skladnik.get("tluszcze")?.value || 0;

      skladnik
        .get("kcalperw")
        ?.setValue(Number(((kcal * ilosc) / 100).toFixed(0)));
      skladnik
        .get("bialkoperw")
        ?.setValue(Number(((bialko * ilosc) / 100).toFixed(2)));
      skladnik
        .get("weglowodanyperw")
        ?.setValue(Number(((weglowodany * ilosc) / 100).toFixed(2)));
      skladnik
        .get("tluszczeperw")
        ?.setValue(Number(((tluszcze * ilosc) / 100).toFixed(2)));
    }

    this.wyliczmakrodlaprzepisu();

    // Nie jest potrzebne wywoływanie detectChanges() w tym miejscu, chyba że masz specyficzne przypadki użycia.
    // this.cdr.detectChanges();
  }

  wyliczmakrodlaprzepisu() {
    const skladniki = this.recipeForm.get("skladniki") as FormArray;
    let wynik = {
      kcal: 0,
      weglowodany: 0,
      tluszcze: 0,
      bialko: 0,
    };
    for (let i = 0; i < skladniki.length; i++) {
      wynik.kcal = wynik.kcal + skladniki.at(i).get("kcalperw")?.value;
      wynik.weglowodany =
        wynik.weglowodany + skladniki.at(i).get("weglowodanyperw")?.value;
      wynik.tluszcze =
        wynik.tluszcze + skladniki.at(i).get("tluszczeperw")?.value;
      wynik.bialko = wynik.bialko + skladniki.at(i).get("bialkoperw")?.value;
    }
    this.recipeForm.get("kcal")?.setValue(wynik.kcal);
    this.recipeForm.get("weglowodany")?.setValue(wynik.weglowodany);
    this.recipeForm.get("bialko")?.setValue(wynik.bialko);
    this.recipeForm.get("tluszcze")?.setValue(wynik.tluszcze);
  }
}
