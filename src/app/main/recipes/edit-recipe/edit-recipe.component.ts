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
import { DatabaseConnectorService } from "../../database-connector.service";
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
  selector: "app-edit-recipe",
  standalone: true,
  templateUrl: "./edit-recipe.component.html",
  styleUrl: "./edit-recipe.component.sass",
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
export class EditRecipeComponent {
  recipeForm!: FormGroup;
  formData = new FormData();
  kategorie: Kategoria[] = [];
  produkty: Produkt[] = [];
  przepis!: Przepis;

  imageUrl: string | ArrayBuffer | null = null;

  searchTerm: string = "";
  selectedValue: string | undefined;
  filteredProdukty: Produkt[] = [];
  id: number | null = null;
  private routeSub: Subscription | null = null;
  shouldUpdateImage: boolean = false;
  oldskladniki: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private dbservice: DatabaseConnectorService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

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
        nazwaPrzepisu: [this.przepis.nazwaPrzepisu, Validators.required],
        image: [
          this.dbservice.APIURL + this.przepis.imageurl,
          Validators.required,
        ], // Zakładamy, że "obraz" to będzie plik, więc początkowo null
        kategoria: this.formBuilder.group({
          id: this.przepis.kategoria.id,
          nazwa: [this.przepis.kategoria.nazwa, Validators.required],
        }),
        skladniki: this.formBuilder.array([]), // Początkowo pusta lista skladników
        instrukcje: this.formBuilder.array([
          this.przepis.instrukcja1,
          this.przepis.instrukcja2 ? this.przepis.instrukcja2 : "",
          this.przepis.instrukcja3 ? this.przepis.instrukcja3 : "",
          this.przepis.instrukcja4 ? this.przepis.instrukcja4 : "",
          this.przepis.instrukcja5 ? this.przepis.instrukcja5 : "",
          this.przepis.instrukcja6 ? this.przepis.instrukcja6 : "",
        ]),
        kcal: [this.przepis.gda.kcal],
        bialko: [this.przepis.gda.bialka],
        weglowodany: [this.przepis.gda.weglowodany],
        tluszcze: [this.przepis.gda.tluszcze],
        searchTerm: [""],
        liczbaporcji:this.przepis.liczbaporcji
      });
    });

    this.dbservice.getKategorie().subscribe((_kategorie) => {
      this.kategorie = _kategorie;

      // Zakładając, że chcesz ustawić pierwszą kategorię jako wybraną
      if (_kategorie.length > 0) {
        const pierwszaKategoria = _kategorie[0];
        this.recipeForm.get("kategoria")!.patchValue({
          id: pierwszaKategoria.id,
          nazwa: pierwszaKategoria.nazwa,
        });
      }
    });

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
            id: [skladnik.id],
            ilosc: [skladnik.ilosc, Validators.required],
            nazwa: [skladnik.nazwaProduktu, Validators.required],
            kcal: [skladnik.kcal],
            tluszcze: [skladnik.tluszcze],
            weglowodany: [skladnik.weglowodany],
            bialko: [skladnik.bialko],
            kcalperw: [skladnik.kcalperw],
            tluszczeperw: [skladnik.tluszczeperw],
            weglowodanyperw: [skladnik.weglowodanyperw],
            bialkoperw: [skladnik.bialkoperw],
          });
          skladnikiFormArray.push(skladnikGroup);
          this.oldskladniki.push(skladnik.id);
        });
      });

    this.wyliczmakrodlaprzepisu();
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

  maxArrayLength(max: number): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (formArray instanceof FormArray && formArray.length > max) {
        return { maxArrayLength: true };
      }
      return null;
    };
  }

  goBack(): void {
    this.location.back();
  }

  submitForm() {
    const instrukcje = this.recipeForm.get("instrukcje") as FormArray;

    for (let i = instrukcje.length - 1; i >= 0; i--) {
      if (!instrukcje.at(i).value) {
        instrukcje.removeAt(i);
      }
    }

    if (this.recipeForm.invalid) {
      console.error("Formularz zawiera błędy!");
      Object.keys(this.recipeForm.controls).forEach((key) => {
        const control = this.recipeForm.get(key);
        if (control?.invalid) {
          console.error(
            `Kontrolka ${key} jest niepoprawna. Błąd:`,
            control.errors
          );
        }
      });
    } else {
      console.log("Formularz poprawny", this.recipeForm.value);

      const inst = this.getInstrukcjeFromForm();
      const przepis: Przepis = {
        id: 0,
        nazwaPrzepisu: this.recipeForm.get("nazwaPrzepisu")?.value,
        instrukcja1: inst[0] || "",
        instrukcja2: inst[1] || "",
        instrukcja3: inst[2] || "",
        instrukcja4: inst[3] || "",
        instrukcja5: inst[4] || "",
        instrukcja6: inst[5] || "",
        kategoria: {
          id: this.recipeForm.get("kategoria.id")?.value,
          nazwa: this.recipeForm.get("kategoria.nazwa")?.value,
        },
        gda: {
          kcal: this.recipeForm.get("kcal")?.value,
          bialka: this.recipeForm.get("bialko")?.value,
          tluszcze: this.recipeForm.get("tluszcze")?.value,
          weglowodany: this.recipeForm.get("weglowodany")?.value,
        },
        liczbaporcji: this.recipeForm.get("liczbaporcji")?.value,
        perPortion: {
          kcal: parseFloat((this.recipeForm.get("kcal")?.value/this.recipeForm.get("liczbaporcji")?.value).toFixed(2)),
          bialka: parseFloat((this.recipeForm.get("bialko")?.value/this.recipeForm.get("liczbaporcji")?.value).toFixed(2)),
          tluszcze: parseFloat((this.recipeForm.get("tluszcze")?.value/this.recipeForm.get("liczbaporcji")?.value).toFixed(2)),
          weglowodany: parseFloat((this.recipeForm.get("weglowodany")?.value/this.recipeForm.get("liczbaporcji")?.value).toFixed(2))
        },
      };

      const skladniki = this.recipeForm.get("skladniki") as FormArray;
      const skladnikiDoBazy: Skladnik[] = skladniki.controls.map((control) => {
        const formGroup = control as FormGroup;
        const s: Skladnik = {
          id: formGroup.get("id")?.value,
          ilosc: formGroup.get("ilosc")?.value,
          nazwaProduktu: formGroup.get("nazwa")?.value,
          kcal: formGroup.get("kcal")?.value,
          tluszcze: formGroup.get("tluszcze")?.value,
          weglowodany: formGroup.get("weglowodany")?.value,
          bialko: formGroup.get("bialko")?.value,
          kcalperw: formGroup.get("kcalperw")?.value,
          tluszczeperw: formGroup.get("tluszczeperw")?.value,
          weglowodanyperw: formGroup.get("weglowodanyperw")?.value,
          bialkoperw: formGroup.get("bialkoperw")?.value,
        };
        return s;
      });

      console.log(skladnikiDoBazy);

      if (this.shouldUpdateImage) {
        this.dbservice.uploadFileToDB(this.formData).pipe(
          concatMap((data) => {
            przepis.imageId = data[0].id;
            return this.dbservice.updateRecipetoDB(przepis, przepis.imageId!, this.id!);
          }),
          concatMap(() => {
            return this.dbservice.deleteSkladniksofRecipeWithId(this.id!);
          }),
          concatMap(() => {
            return this.dbservice.createSkladniksofRecipe(skladnikiDoBazy, this.id!);
          })
        ).subscribe({
          next: () => {
            this.submitedMessage("Recipe updated successfully!");
          },
          error: (error) => {
            console.error("Error processing the form:", error);
          }
        });
      } else {
        this.dbservice.updateRecipetoDB(przepis, przepis.imageId!, this.id!).pipe(
          concatMap(() => {
            return this.dbservice.deleteSkladniksofRecipeWithId(this.id!);
          }),
          concatMap(() => {
            return this.dbservice.createSkladniksofRecipe(skladnikiDoBazy, this.id!);
          })
        ).subscribe({
          next: () => {
            this.submitedMessage("Recipe updated successfully!");
            this.goBack();
          },
          error: (error) => {
            console.error("Error processing the form:", error);
          }
        });
      }


    }
  }

  getInstrukcjeFromForm(): string[] {
    const instrukcjeArray = this.recipeForm.get("instrukcje") as FormArray;
    return instrukcjeArray.controls.map((control) => control.value);
  }

  triggerFileInput() {
    const fileInput = document.getElementById("fileInput") as HTMLElement;
    fileInput.click();
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.append("files", file);
      console.log(this.formData);
      this.recipeForm.patchValue({ image: file }); // Ensure the form control is updated

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.shouldUpdateImage = true;
    }
  }

  hasError(controlPath: string, errorType: string): boolean {
    const control = this.recipeForm.get(controlPath);
    return control
      ? control.hasError(errorType) && (control.dirty || control.touched)
      : false;
  }

  onKategoriaChange(event: MatSelectChange) {
    const wybranaKategoria = this.kategorie.find(
      (kat) => kat.nazwa === event.value
    );
    if (wybranaKategoria) {
      this.recipeForm.get("kategoria")?.patchValue({
        id: wybranaKategoria.id,
        nazwa: wybranaKategoria.nazwa,
      });
    }
    console.log(this.recipeForm.value);
  }

  onProduktChange(event: MatSelectChange, sklindex: number) {
    const wybranyProdukt = this.produkty.find(
      (kat) => kat.nazwaProduktu === event.value
    );
    if (wybranyProdukt) {
      const newSkladnik = this.formBuilder.group({
        id: wybranyProdukt?.id,
        nazwa: wybranyProdukt?.nazwaProduktu,
        ilosc: 0,
        kcal: wybranyProdukt?.kcal,
        tluszcze: wybranyProdukt?.tluszcze,
        weglowodany: wybranyProdukt?.weglowodany,
        bialko: wybranyProdukt?.bialko,
        kcalperw: 0,
        weglowodanyperw: 0,
        tluszczeperw: 0,
        bialkoperw: 0,
      });
      const skladniki = this.recipeForm.get("skladniki") as FormArray;

      // Użyj setControl, aby zastąpić kontrolkę na pozycji sklindex nową kontrolką newSkladnik
      skladniki.setControl(sklindex, newSkladnik);
    }
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
    this.recipeForm.get("kcal")?.setValue(wynik.kcal.toFixed(2));
    this.recipeForm.get("weglowodany")?.setValue(wynik.weglowodany.toFixed(2));
    this.recipeForm.get("bialko")?.setValue(wynik.bialko.toFixed(2));
    this.recipeForm.get("tluszcze")?.setValue(wynik.tluszcze.toFixed(2));
  }

  onInputKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "NumPad0",
      "NumPad1",
      "NumPad2",
      "NumPad3",
      "NumPad4",
      "NumPad5",
      "NumPad6",
      "NumPad7",
      "NumPad8",
      "NumPad9",
      "ArrowLeft",
      "ArrowRight",
      "Backspace",
      "Delete",
      "Enter",
    ];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  checkFields(index: number): void {
    const instrukcje = this.recipeForm.get("instrukcje") as FormArray;

    const currentControl = instrukcje.at(index);

    if (!currentControl.value && instrukcje.length > 1) {
      // Jeśli obecne pole jest puste i jest więcej niż jedno pole, usuń obecne pole
      instrukcje.removeAt(index);
    } else if (
      index === instrukcje.length - 1 &&
      currentControl.value &&
      instrukcje.length < 6
    ) {
      // Jeśli obecne pole jest ostatnie i nie jest puste, i jest mniej niż 6 pól, dodaj nowe pole
      instrukcje.push(this.formBuilder.control("", Validators.required));
    }
  }

  deleteSkladnik(index: number) {
    this.skladniki.removeAt(index);
  }

  addSkladnik() {
    const skladniki = this.recipeForm.get("skladniki") as FormArray;
    const newSkladnik = this.formBuilder.group({
      id: 0,
      nazwa: "",
      ilosc: 0,
      kcal: 0,
      tluszcze: 0,
      weglowodany: 0,
      bialko: 0,
      kcalperw: 0,
      weglowodanyperw: 0,
      tluszczeperw: 0,
      bialkoperw: 0,
    });
    skladniki.push(newSkladnik);
    this.cdr.detectChanges();
  }

  submitedMessage(message: string) {
    this._snackBar.open(message, "ok!");
  }

  filterOptions() {
    const searchTerm = this.recipeForm.get("searchTerm")!.value;
    if (!searchTerm) {
      this.filteredProdukty = [...this.produkty];
    } else {
      this.filteredProdukty = this.produkty.filter((prod) =>
        prod.nazwaProduktu.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
