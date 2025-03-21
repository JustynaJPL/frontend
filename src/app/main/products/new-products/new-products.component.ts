import { Component } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule, Location } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ProductsService } from "../products.service";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { Produkt } from "../../../models/Produkt";
import { Subscription } from "rxjs";

@Component({
  selector: "app-new-products",
  standalone: true,
  templateUrl: "./new-products.component.html",
  styleUrl: "./new-products.component.sass",
  imports: [
    AppNaviComponent,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class NewProductsComponent {
  newProductForm: FormGroup;
  produkty: Produkt[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private prodService: ProductsService,
    private _snackBar: MatSnackBar,
  ) {
    this.newProductForm = this.formBuilder.group({
      id: [null],
      nazwaProduktu: ["", Validators.required],
      kcal: ["", Validators.required],
      tluszcze: ["", Validators.required],
      weglowodany: ["", Validators.required],
      bialko: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    const produktySubscription = this.prodService.produkty$.subscribe(
      (produkty) => {
        this.produkty = produkty;
      }
    );
    this.subscriptions.add(produktySubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    this.prodService.addProdukt(this.newProductForm.value).subscribe({
      next: () => {
        this._snackBar.open("Produkt dodany", "Zamknij", {
          duration: 2000,
        });
        this.goBack();
      },
      error: () => {
        this._snackBar.open("Błąd dodawania produktu", "Zamknij", {
          duration: 2000,
        });
      },
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.newProductForm.controls[controlName].hasError(errorName);
  }

  resetForm(): void {
    this.newProductForm.reset();
  }

  handleInput(event: KeyboardEvent, inputValue: string): void {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

    if (allowedKeys.includes(event.key)) {
      return; // Pozwalamy na użycie tych klawiszy
    }

    const charCode = event.which ? event.which : event.keyCode;

    // Sprawdzamy, czy wpisany znak to cyfra (0-9) lub kropka
    if (
      (charCode >= 48 && charCode <= 57) || // Klawiatura główna (0-9)
      (charCode >= 96 && charCode <= 105)   // Klawiatura numeryczna (0-9)
    ) {
      return; // Pozwalamy na wpisanie cyfry
    }

    // Obsługa kropki, ale tylko jednej
    if (event.key === "." && !inputValue.includes(".")) {
      return;
    }

    // Jeśli znak nie pasuje do dozwolonych - blokujemy wpisywanie
    event.preventDefault();
  }


  checkForDoubles(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.produkty.find((p) => p.nazwaProduktu === value)) {
      this.newProductForm.controls["nazwaProduktu"].setErrors({
        duplicate: true,
      });
      this.newProductForm.setErrors({ invalid: true });
    }
  }
}
