import { Component, ViewChild } from "@angular/core";
import { DatabaseConnectorService } from "../../../database-services/database-connector.service";
import { CommonModule } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Przepis } from "../../../models/Przepis";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { RouterModule } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { Observable } from "rxjs";

@Component({
  selector: "app-recipe-list",
  standalone: true,
  imports: [
    CommonModule,
    AppNaviComponent,
    MatTableModule,
    RouterModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatSortModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: "./recipe-list.component.html",
  styleUrl: "./recipe-list.component.sass",
})
export class RecipeListComponent {
  dataSource!: MatTableDataSource<Przepis>;
  recipes$!: Observable<Przepis[]>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  przepisy: Przepis[] = [];

  displayedColumns: string[] = [
    "nazwa",
    "kategoria",
    "kcal",
    "bialko",
    "tluszcze",
    "weglowodany",
    "actions",
  ];

  constructor(private dbconnect: DatabaseConnectorService) {
    this.dataSource = new MatTableDataSource<Przepis>();
  }

  ngOnInit(): void {
    this.recipes$ = this.dbconnect.recipes$;
    this.dbconnect.refreshRecipes();
    this.recipes$.subscribe((recipes) => {
      this.dataSource.data = recipes;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteRecipe(id: number) {
    this.dbconnect.deleteRecipeWithId(id).subscribe(
      () => {
        // Usuń przepis z przepisów
        this.przepisy = this.przepisy.filter((recipe) => recipe.id !== id);
        // Zaktualizuj dane w dataSource
        this.dataSource.data = this.przepisy;
        console.log(`Przepis o id ${id} został usunięty.`);
      },
      (error) => {
        console.log(`Błąd podczas usuwania przepisu o id ${id}:`, error);
      }
    );
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
