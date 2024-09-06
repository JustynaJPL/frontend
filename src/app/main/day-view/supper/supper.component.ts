import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Posilek } from '../../../models/Posilek';
import { MealsService } from '../meals.service';

@Component({
  selector: 'app-supper',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule],
  templateUrl: './supper.component.html',
  styleUrl: './supper.component.sass'
})
export class SupperComponent {
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
    this.mealsService.supper$.subscribe((posilki: Posilek[]) => {
      this.dataSource = new MatTableDataSource(posilki);
    });
  }

  onClick(): void {
    // Tu możesz umieścić logikę do dodawania nowego posiłku
    console.log("Dodaj nowy posiłek");
  }

}
