import { CommonModule, Location } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ProductsService } from "../../../main/products/products.service";
import { ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { Subject } from "rxjs/internal/Subject";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-view-product",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIcon
  ],
  templateUrl: "./view-product.component.html",
  styleUrl: "./view-product.component.sass",
})
export class ViewProductComponent {
  form!: FormGroup;
  id: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private prodService: ProductsService, private route: ActivatedRoute,private location: Location) {

    this.route.params.subscribe((params) => {
      console.log(params);
      this.id = params["id"];
    });

    this.form = this.fb.group({
      id: [0],
      nazwaProduktu: [""],
      kcal: [0],
      tluszcze: [0],
      weglowodany: [0],
      bialko: [0],
    });
  }

  ngOnInit() {
    // Pobierz dane produktu i ustaw je w formularzu
    this.prodService.getProduktWithID(this.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((product) => {
            if (product) {
              this.form.patchValue(product);
              console.log("Form", this.form.value);

            } else {
              console.error("Product not found");
            }
          });
  }

   cancel() {
    this.location.back();
  }
}
