import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { RouterModule } from "@angular/router";
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { Observable } from "rxjs";
import { Przepis } from "../../../models/Przepis";
import { DatabaseConnectorService } from "../../../main/database-connector.service";

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
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase(); // Normalizacja wartości filtru
  }
}
