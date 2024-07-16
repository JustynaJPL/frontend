import { MatIconModule } from "@angular/material/icon";
import { Component } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray,  } from "@angular/forms";

@Component({
  selector: "app-new-recipe",
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: "./new-recipe.component.html",
  styleUrl: "./new-recipe.component.sass",
})
export class NewRecipeComponent {
  recipeForm!: FormGroup;
  formData = new FormData();

  constructor(private location: Location, private formBuilder: FormBuilder,) {}

  ngOnInit():void {
    this.recipeForm = this.formBuilder.group({
      nazwaPrzepisu: ['', Validators.required],
      image: ['', Validators.required], // Zakładamy, że "obraz" to będzie plik, więc początkowo null
      kategoria: this.formBuilder.group({
        id: 0,
        nazwa: ['', Validators.required],
      }),
      skladniki: this.formBuilder.array([]), // Początkowo pusta lista skladników
      instrukcje: this.formBuilder.array(
        [
          this.formBuilder.control('', Validators.required)
          // Możesz dodać więcej elementów początkowych w ten sam sposób
        ],
        { validators: this.maxArrayLength(6) }
      ),
      kcal: [0],
      bialko: [0],
      weglowodany: [0],
      tluszcze: [0],
    });
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

  submitForm(){

  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.append("files", file);
      console.log(this.formData);
    }
    this.dbservice.uploadFileToDB(this.formData).subscribe((data) => {
      this.przepis.imageurl = data;
      this.imageUrl = "http://localhost:1337" + this.przepis.imageurl;
    });
  }
}
