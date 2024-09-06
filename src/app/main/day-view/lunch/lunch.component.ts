import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MealsService } from '../meals.service';
import { Posilek } from '../../../models/Posilek';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lunch',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,],
  templateUrl: './lunch.component.html',
  styleUrl: './lunch.component.sass'
})
export class LunchComponent {
  displayedColumns: string[] = [
    "nazwa",
    "kcal",
    "bialka",
    "tluszcze",
    "weglowodany",
  ]; // Kolumny, które będą wyświetlane
  dataSource!: MatTableDataSource<Posilek>; // Dane dla tabeli

  constructor(private mealsService: MealsService) {}

  ngOnInit(): void {
    // Pobranie danych z serwisu i przypisanie ich do dataSource
    this.mealsService.lunch$.subscribe((posilki: Posilek[]) => {
      this.dataSource = new MatTableDataSource(posilki);
    });
  }

  onClick(): void {
    // Tu możesz umieścić logikę do dodawania nowego posiłku
    console.log("Dodaj nowy posiłek");
  }

}
