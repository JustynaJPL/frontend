import { Component, Input } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { ActivatedRoute, Data } from "@angular/router";
import { MealsService } from "../meals.service";
import { Posilek } from "../../../models/Posilek";
import { combineLatest, Observable, Subject } from "rxjs";
import { catchError, map, switchMap, takeUntil } from "rxjs/operators";
import { Kategoria } from "../../../models/Kategoria";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Location } from "@angular/common";
import { ChangeDetectorRef } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { MatRadioButton } from "@angular/material/radio";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { DatabaseConnectorService } from "../../../database-services/database-connector.service";

@Component({
  selector: "app-change-meal",
  standalone: true,
  templateUrl: "./change-meal.component.html",
  styleUrl: "./change-meal.component.sass",
  imports: [
    CommonModule,
    MatCardModule,
    AppNaviComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class ChangeMealComponent {
  mode: string = "edit";
  id: number = 0;
  @Input() form!: FormGroup;
  public posilki$: Observable<Posilek[]>;
  private destroy$ = new Subject<void>();
  public kategorie$: Observable<Kategoria[]>;
  public selectedDateValue$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private meals: MealsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dbConnect: DatabaseConnectorService,
    private location: Location
  ) {
    this.route.params.subscribe((params) => {
      console.log(params);
      this.id = params["id"];
      this.mode = params["mode"];
    });
    this.selectedDateValue$ = this.meals.currentDate$;
    this.kategorie$ = this.meals.kategorie$;
    this.posilki$ = this.meals.posilki$;

    this.form = this.fb.group({
      nazwa: [""],
      kategoria: [null],
      ilosc: [null, Validators.required],
      typ: ["meal"], // meal lub ingredient
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
  }

  ngOnInit(): void {
    this.meals.getPosilekofIdofUser(this.id).subscribe({
      next: (posilek) => {
        console.log("Pobrano posiłek:", posilek);

        // Patchowanie formularza
        this.form.patchValue({
          nazwa: posilek.attributes.przepis.data
            ? posilek.attributes.przepis.data.attributes.nazwaPrzepisu
            : posilek.attributes.produkt.data.attributes.nazwaProduktu,
          kategoria: posilek.attributes.kategoria.data.attributes.nazwakategori,
          typ: posilek.attributes.przepis.data ? "Posiłek" : "Produkt",
          ilosc:
            posilek.attributes.ilosc_produktu ||
            posilek.attributes.liczba_porcji_przepisu,
          kcal: posilek.attributes.posilekGDA.kcal,
          bialka: posilek.attributes.posilekGDA.bialka,
          weglowodany: posilek.attributes.posilekGDA.weglowodany,
          tluszcze: posilek.attributes.posilekGDA.tluszcze,
          resetilosc:
          posilek.attributes.ilosc_produktu ||
          posilek.attributes.liczba_porcji_przepisu,
        });

        console.log("Ustawiono wartości:", this.form.value);

        // Wywołanie odpowiedniej metody z DbConnectService w zależności od typu
        const typ = this.form.value.typ;
        console.log("Typ:", typ);
        const id =
          posilek.attributes.przepis?.data?.id ||
          posilek.attributes.produkt?.data?.id;
        console.log("ID:", id);

        if (typ == "Posiłek" && id) {
          this.dbConnect.getPrzepisMinimal(id).subscribe({
            next: (przepisMinimal) => {
              console.log("Pobrano przepis minimal:", przepisMinimal);
              this.form.patchValue({
                kcal100: przepisMinimal.gda.kcal,
                bialka100: przepisMinimal.gda.bialka,
                weglowodany100: przepisMinimal.gda.weglowodany,
                tluszcze100: przepisMinimal.gda.tluszcze,
                liczbamaxporcji: przepisMinimal.maxliczba_porcji,
                url: przepisMinimal.imgUrl,
              }); // Patchowanie formularza
              console.log("Ustawiono wartości:", this.form.value);
            },
            error: (err) => {
              console.error(
                "Wystąpił błąd podczas pobierania przepisu minimal:",
                err.message
              );
            },
          });
        } else if (typ == "Produkt" && id) {
          this.dbConnect.getProduktMinimal(id).subscribe({
            next: (skladnikMinimal) => {
              console.log("Pobrano składnik minimal:", skladnikMinimal);
              this.form.patchValue({
                kcal100: skladnikMinimal.kcal,
                bialka100: skladnikMinimal.bialko,
                weglowodany100: skladnikMinimal.weglowodany,
                tluszcze100: skladnikMinimal.tluszcze
              }); // Patchowanie formularza
              console.log("Ustawiono wartości:", this.form.value);
            },
            error: (err) => {
              console.error(
                "Wystąpił błąd podczas pobierania składnika minimal:",
                err.message
              );
            },
          });
        }
      },
      error: (err) => {
        console.error("Wystąpił błąd:", err.message);
      },
    });
  }

  przepisWyliczMakro(lp: number) {
    if (!this.form.value.kcal100 || !this.form.value.liczbamaxporcji) {
      return;
    }

    this.form.patchValue({
      kcal: +((this.form.value.kcal100 / this.form.value.liczbamaxporcji) * lp).toFixed(2),
      bialka: +((this.form.value.bialka100 / this.form.value.liczbamaxporcji) * lp).toFixed(2),
      weglowodany: +((this.form.value.weglowodany100 / this.form.value.liczbamaxporcji) * lp).toFixed(2),
      tluszcze: +((this.form.value.tluszcze100 / this.form.value.liczbamaxporcji) * lp).toFixed(2),
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
      tluszcze: +((this.form.value.tluszcze100 / 100) * wagag).toFixed(2)
    });
    this.cdr.markForCheck();
  }


  ngOnDestroy() {
    // Zakończ subskrypcję, gdy komponent zostanie zniszczony
    this.destroy$.next();
    this.destroy$.complete();
  }

  cancel() {
    this.location.back();
  }

  getTypDisplayName(typ: string): string {
    return typ === "meal"
      ? "Posiłek"
      : typ === "ingredient"
      ? "Składnik"
      : "Nieznany typ";
  }

  zmianaIlosci() {
    const typ = this.form.get('typ')?.value;
    const ilosc = this.form.get('ilosc')?.value;

    if (ilosc == null || isNaN(ilosc)) {
      return; // Jeśli ilosc jest null lub NaN, zakończ funkcję
    }

    if (typ === 'Posiłek') {
      this.przepisWyliczMakro(ilosc);
    } else {
      this.produktWyliczMakro(ilosc);
    }
  }



  getKategoriaDisplayName(kategoria: any): string {
    // Tu można rozszerzyć logikę na wyświetlanie nazw kategorii na podstawie ID
    return kategoria ? kategoria : "Nieznana kategoria";
  }

  saveMeal() {


  }

  resetForm() {
    this.form.patchValue({
      ilosc: this.form.value.resetilosc,
    });
    this.zmianaIlosci();
  }

  getImage() {
    if (this.form.value.url === "") {
      return "../../../assets/place-add-meal.jpg";
    }
    else{
    return this.dbConnect.APIURL + this.form.value.url;
  }
  }
}
