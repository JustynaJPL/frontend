import { Component } from '@angular/core';
import { Kategoria } from '../../../models/Kategoria';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealsService } from '../meals.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";

@Component({
    selector: 'app-add-meal',
    standalone: true,
    templateUrl: './add-meal.component.html',
    styleUrl: './add-meal.component.sass',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatRadioModule,
        MatSelectModule,
        AppNaviComponent
    ]
})
export class AddMealComponent {
  categories: Kategoria[] = []; // Lista kategorii
  form: FormGroup; // Formularz dodawania posiłku/składnika
  isMeal: boolean = true; // Flaga: czy dodajemy posiłek czy składnik
  katId:number=1;
  constructor(
    private fb: FormBuilder,
    private mealsService: MealsService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nazwa: ['', [Validators.required, Validators.minLength(3)]],
      kategoria: [null, Validators.required],
      typ: ['meal', Validators.required], // meal lub ingredient
      kcal: [0, [Validators.required, Validators.min(0)]],
      bialka: [0, [Validators.required, Validators.min(0)]],
      weglowodany : [0, [Validators.required, Validators.min(0)]],
      tluszcze: [0, [Validators.required, Validators.min(0)]],
    });

  }


  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      this.katId = +params['id']; // Pobierz parametr id
      console.log('Wybrana kategoria nr: ', this.katId);
    });
    // Pobierz listę kategorii
    this.mealsService.getKategorie().subscribe({
      next: (kategorie) => (this.categories = kategorie),
      error: (err) => console.error('Nie udało się pobrać kategorii', err),
    });

    // Nasłuchuj zmiany typu (posiłek/składnik)
    this.form.get('type')?.valueChanges.subscribe((value) => {
      this.isMeal = value === 'meal';
    });
  }

  save() {
    // if (this.form.invalid) {
    //   console.warn('Formularz jest niepoprawny');
    //   return;
    // }

    // const newItem = {
    //   name: this.form.value.name,
    //   categoryId: this.form.value.category,
    //   isMeal: this.isMeal,
    //   gda: {
    //     kcal: this.form.value.calories,
    //     protein: this.form.value.protein,
    //     carbs: this.form.value.carbs,
    //     fats: this.form.value.fats,
    //   },
    // };

    // // Wyślij dane do API
    // this.mealsService
    //   .addMealOrIngredient(newItem)
    //   .subscribe({
    //     next: () => {
    //       console.log('Dodano element:', newItem);
    //       this.router.navigate(['/']); // Przekierowanie na główną stronę
    //     },
    //     error: (err) =>
    //       console.error('Błąd podczas dodawania elementu:', err),
    //   });
  }
  cancel() {
    this.location.back();
  }


}
