import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { DatabaseConnectorService } from "../../../database-services/database-connector.service";
import { CdkTableDataSourceInput } from "@angular/cdk/table";
import { Posilek } from "../../../models/Posilek";
import { MealsService } from "../meals.service";

@Component({
  selector: "app-breakfast",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: "./breakfast.component.html",
  styleUrl: "./breakfast.component.sass",
})
export class BreakfastComponent {
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
    this.mealsService.breakfast$.subscribe((posilki: Posilek[]) => {
      this.dataSource = new MatTableDataSource(posilki);
    });
  }

  onClick(): void {
    // Tu możesz umieścić logikę do dodawania nowego posiłku
    console.log("Dodaj nowy posiłek");
  }
}
