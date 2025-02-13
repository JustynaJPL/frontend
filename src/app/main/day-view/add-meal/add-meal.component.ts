import { Component } from "@angular/core";
import { Kategoria } from "../../../models/Kategoria";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MealsService } from "../meals.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioModule } from "@angular/material/radio";
import { CommonModule, Location } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { DatabaseConnectorService } from "../../database-connector.service";
import { ChangeDetectorRef } from "@angular/core";
import { Przepis } from "../../../models/Przepis";
import { Produkt } from "../../../models/Produkt";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-add-meal",
  standalone: true,
  templateUrl: "./add-meal.component.html",
  styleUrl: "./add-meal.component.sass",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    AppNaviComponent,
    MatIconModule
  ],
})
export class AddMealComponent {
  categories: Kategoria[] = []; // Lista kategorii
  form: FormGroup; // Formularz dodawania posiłku/składnika
  isMeal: boolean = true; // Flaga: czy dodajemy posiłek czy składnik
  katId: number = 1;
  recipes: Przepis[] = [];
  produkt: Produkt[] = [];
  items: { id: number; nazwa: string }[] = []; // Lista przepisów lub
  // //produktów które są wyświetlane w select po wybraniu radiobuttona

  private destroy$ = new Subject<void>();
  userid: number = 1;

  constructor(
    private fb: FormBuilder,
    private mealsService: MealsService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private dbConnect: DatabaseConnectorService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id: [null],
      dataposilku: [""],
      nazwa: [""],
      kategoria: [null, Validators.required],
      ilosc: [null, Validators.required],
      typ: ["meal", Validators.required], // Posiłek/Składnik
      kcal: [0, [Validators.required, Validators.min(0)]],
      bialka: [0, [Validators.required, Validators.min(0)]],
      weglowodany: [0, [Validators.required, Validators.min(0)]],
      tluszcze: [0, [Validators.required, Validators.min(0)]],
      kcal100: [0],
      bialka100: [0],
      weglowodany100: [0],
      tluszcze100: [0],
      liczbamaxporcji: [0],
      url: [""],
      resetilosc: [null],
    });

    this.route.params.subscribe((params) => {
      console.log(params);
      this.katId = params["id"];
      this.form.get("kategoria")?.setValue(this.katId);
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.katId = +params["id"]; // Pobierz parametr -
      // numer kategorii jaka była wybrana w poprzednim ekranie
      console.log("Wybrana domyślna kategoria: ", this.katId);
    });

    this.mealsService.currentDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((date) => {
        console.log("Data posiłku: ", date);
        this.form.get("dataposilku")?.setValue(date);
      });

    this.dbConnect.getUserDBID().subscribe({
      next: (id: number) => {
        this.userid = id;
      },
      error: (err) => console.error("Nie udało się pobrać ID użytkownika", err),
    });

    // Pobierz listę kategorii z serwisu
    this.mealsService.getKategorie().subscribe({
      next: (kategorie) => {
        this.categories = kategorie;

        // Ustaw domyślną wartość kategorii w formularzu
        const selectedCategory = this.categories.find(
          (category) => category.id === this.katId
        );
        if (selectedCategory) {
          this.form.get("kategoria")?.setValue(this.katId);
        }
      },
      error: (err) => console.error("Nie udało się pobrać kategorii", err),
    });

    // Nasłuchuj zmiany typu (Posiłek lub Produkt)
    this.form.get("typ")?.valueChanges.subscribe((value) => {
      this.isMeal = value === "meal";
      this.form.get("nazwa")?.reset(null, { emitEvent: false });
      this.form.get("ilosc")?.reset(null, { emitEvent: false });
      this.form.get("bialka")?.reset(null, { emitEvent: false });
      this.form.get("kcal")?.reset(null, { emitEvent: false });
      this.form.get("weglowodany")?.reset(null, { emitEvent: false });
      this.form.get("tluszcze")?.reset(null, { emitEvent: false });

      this.form.get("bialka100")?.reset(null, { emitEvent: false });
      this.form.get("kcal100")?.reset(null, { emitEvent: false });
      this.form.get("weglowodany100")?.reset(null, { emitEvent: false });
      this.form.get("tluszcze100")?.reset(null, { emitEvent: false });
      this.form.get("liczbamaxporcji")?.reset(null, { emitEvent: false });

      if (this.isMeal) {
        this.loadRecipes(); // Załaduj przepisy
      } else {
        this.loadProducts(); // Załaduj produkty
      }
    });

    // Domyślnie ustaw na „Posiłek” i załaduj przepisy
    this.form.get("typ")?.setValue("meal");
    this.loadRecipes();
    this.form.get("url")?.valueChanges.subscribe((newUrl) => {
      this.getImage();
    });
  }

  loadRecipes() {
    this.dbConnect.getAllrecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.items = this.recipes
          .map((recipe) => ({
            id: recipe.id,
            nazwa: recipe.nazwaPrzepisu,
          }))
          .sort((a, b) => a.nazwa.localeCompare(b.nazwa)); // Sortowanie po nazwie
        console.log("Załadowano i posortowano przepisy:", this.items);
      },
      error: (err) => console.error("Nie udało się pobrać przepisów", err),
    });
  }

  loadProducts() {
    this.dbConnect.getAllProdukts().subscribe({
      next: (products) => {
        this.produkt = products; // Zapisz dane w obiekcie produkt
        this.items = this.produkt.map((product) => ({
          id: product.id,
          nazwa: product.nazwaProduktu,
        }));
        console.log("Załadowano produkty:", this.produkt);
      },
      error: (err) => console.error("Nie udało się pobrać produktów", err),
    });
  }

  onSelectChange(event: any) {
    const selectedValue = event.value; // Pobierz wybraną wartość (id elementu)
    console.log("Wybrano element o id:", selectedValue);

    if (this.isMeal) {
      // Jeśli wybrano posiłek (przepis)
      const selectedRecipe = this.recipes.find(
        (recipe) => recipe.id === selectedValue
      );

      if (selectedRecipe) {
        console.log("Wybrano przepis:", selectedRecipe);
        this.form.patchValue({
          id: selectedRecipe.id,
          url: selectedRecipe.imageurl || "",
          kcal100: selectedRecipe.gda.kcal,
          bialka100: selectedRecipe.gda.bialka,
          weglowodany100: selectedRecipe.gda.weglowodany,
          tluszcze100: selectedRecipe.gda.tluszcze,
          liczbamaxporcji: selectedRecipe.liczbaporcji || 1,
        });
      }
      this.form.get("ilosc")?.setValue(""); // Wyczyść pole ilość
    } else {
      // Jeśli wybrano produkt
      const selectedProduct = this.produkt.find(
        (product) => product.id === selectedValue
      );

      if (selectedProduct) {
        console.log("Wybrano produkt:", selectedProduct);
        this.form.patchValue({
          id: selectedProduct.id,
          kcal100: selectedProduct.kcal,
          bialka100: selectedProduct.bialko,
          weglowodany100: selectedProduct.weglowodany,
          tluszcze100: selectedProduct.tluszcze,
          liczbamaxporcji: 1, // Domyślna wartość dla produktu
        });
      }
      this.form.get("ilosc")?.setValue(""); // Wyczyść pole ilość
    }
  }

  getImage() {
    console.log("Aktualizacja obrazka:", this.form.value.url);
    if (this.form.value.url === "") {
      return "../../../assets/place-add-meal.jpg";
    } else {
      return this.dbConnect.APIURL + this.form.value.url;
    }
  }

  saveMeal() {
    if (this.form.invalid) {
      console.error("Formularz jest niepoprawny");
      return;
    } else {
      const meal = this.form.value;
      console.log("Zapisywanie posiłku:", meal);

      if (this.isMeal) {
        this.mealsService.addMealPosilek(meal, this.userid).subscribe({
          next: () => {
            console.log("Posiłek został zapisany");
            this.router.navigate(["/logged/dashboard/today"]);
          },
          error: (err) => {
            console.error("Nie udało się zapisać posiłku", err);
          },
        });
      } else {
        this.mealsService.addMealProdukt(meal, this.userid).subscribe({
          next: () => {
            console.log("Produkt został zapisany");
            this.router.navigate(["/logged/dashboard/today"]);
          },
          error: (err) => {
            console.error("Nie udało się zapisać produktu", err);
          },
        });
      }
    }
  }

  addRecipe() {
    this.router.navigate(["/logged/recipes/new"]);
  }

  addProduct() {
    this.router.navigate(["/logged/products/new"]);
  }

  cancel() {
    this.location.back();
  }

  zmianaIlosci() {
    const ilosc = this.form.get("ilosc")?.value;

    if (ilosc == null || isNaN(ilosc)) {
      return; // Jeśli ilosc jest null lub NaN, zakończ funkcję
    }

    if (this.isMeal) {
      this.przepisWyliczMakro(ilosc);
    } else {
      this.produktWyliczMakro(ilosc);
    }
  }

  przepisWyliczMakro(lp: number) {
    if (!this.form.value.kcal100 || !this.form.value.liczbamaxporcji) {
      return;
    }

    this.form.patchValue({
      kcal: +(
        (this.form.value.kcal100 / this.form.value.liczbamaxporcji) *
        lp
      ).toFixed(2),
      bialka: +(
        (this.form.value.bialka100 / this.form.value.liczbamaxporcji) *
        lp
      ).toFixed(2),
      weglowodany: +(
        (this.form.value.weglowodany100 / this.form.value.liczbamaxporcji) *
        lp
      ).toFixed(2),
      tluszcze: +(
        (this.form.value.tluszcze100 / this.form.value.liczbamaxporcji) *
        lp
      ).toFixed(2),
    });
    this.cdr.markForCheck();
  }

  produktWyliczMakro(wagag: number) {
    if (!this.form.value.kcal100) {
      return;
    }

    this.form.patchValue({
      kcal: +((this.form.value.kcal100 / 100) * wagag).toFixed(2),
      bialka: +((this.form.value.bialka100 / 100) * wagag).toFixed(2),
      weglowodany: +((this.form.value.weglowodany100 / 100) * wagag).toFixed(2),
      tluszcze: +((this.form.value.tluszcze100 / 100) * wagag).toFixed(2),
    });
    this.cdr.markForCheck();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Zablokuj wprowadzanie, jeśli znak nie jest cyfrą
    }
  }

  checkRecipeWithId() {
    if (this.form.get("id")?.value === null) {
      this.form.get("id")?.setErrors({ required: true });
    } else {
      this.router.navigate([
        "/logged/recipes/view",
        this.form.get("id")?.value,
      ]);
    }
  }

  checkProductWithId() {
    if (this.form.get("id")?.value === null) {
      this.form.get("id")?.setErrors({ required: true });
      console.error("Nie podano id produktu");
    } else {
      console.log(
        "Przekierowanie do produktu o id:",
        this.form.get("id")?.value
      );
      this.router.navigate([
        "/logged/products/",'view',
        this.form.get("id")?.value,
      ]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  zmianaDaty(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      console.log("Zmiana daty:", input.value);
      const newDate = new Date(input.value);
      let formattedDate = this.mealsService.formatDate(newDate);
      this.mealsService.setDate(formattedDate);
    } else {
      console.error("Data jest null");
    }
  }
}
