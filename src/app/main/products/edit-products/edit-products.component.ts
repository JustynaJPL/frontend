import { Component, Input } from "@angular/core";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from "@angular/common";
import { ProductsService } from "../products.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject, Subscription, takeUntil } from "rxjs";
import { Location } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { Produkt } from "../../../models/Produkt";

@Component({
  selector: "app-edit-products",
  standalone: true,
  templateUrl: "./edit-products.component.html",
  styleUrl: "./edit-products.component.sass",
  imports: [
    AppNaviComponent,
    CommonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
})
export class EditProductsComponent {
  id: number = 0;
  mode: string = "edit";
  @Input() form!: FormGroup;
  produkty:Produkt[] = [];
  prodreset!: Produkt;

  private destroy$ = new Subject<void>();

  constructor(
    private prodService: ProductsService,
    // private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
  ) {
    this.route.params.subscribe((params) => {
      console.log(params);
      this.id = params["id"];
      this.mode = params["mode"];
    });

    this.form = this.fb.group({
      id: [0],
      nazwaProduktu: ["", [Validators.required, Validators.minLength(3)]],
      kcal: [0, Validators.required],
      tluszcze: [0, Validators.required],
      weglowodany: [0, Validators.required],
      bialko: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    this.prodService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((produkty) => {
        this.produkty = produkty;
        console.log(produkty);
      });

    this.prodService.getProductWithID(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        if (product) {
          this.form.patchValue(product);
          console.log("Form", this.form.value);
          this.prodreset = product;
        } else {
          console.error("Product not found");
        }
      });

    this.updateFormState();
  }

  private updateFormState(): void {
    if (this.mode === "view") {
      this.form.disable();
    } else if (this.mode === "edit") {
      this.form.enable();
    }
  }

  ngOnDestroy() {
    // Zakończ subskrypcję, gdy komponent zostanie zniszczony
    this.destroy$.next();
    this.destroy$.complete();
  }

  cancel() {
    this.location.back();
  }
  onSubmit() {
    console.log("Form", this.form.value);
    if (this.mode === "edit") {
      this.prodService.editProduct(this.form.value)
      .subscribe((response) => {
        console.log("Product updated", response);
        this.location.back();
      });
    }
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.form.controls[controlName].hasError(errorName);
  }

  resetForm(): void {
    this.form.patchValue(this.prodreset);
  }

  handleInput(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      charCode > 31 &&
      (charCode < 48 || charCode > 57) && // Not a number from the main keyboard
      (charCode < 96 || charCode > 105) // Not a number from the numeric keypad
    ) {
      event.preventDefault();
    }
  }

  checkForDoubles(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    // console.log(value);
    const isDuplicate = this.produkty.some((p) => p.nazwaProduktu === value);
    // console.log(isDuplicate);
    if (isDuplicate) {
      this.form.get("nazwaProduktu")?.setErrors({
        duplicate: true,
      });
      this.form.setErrors({ invalid: true });
    }
  }
}
