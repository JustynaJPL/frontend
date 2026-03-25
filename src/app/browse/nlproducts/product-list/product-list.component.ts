import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Produkt } from "../../../models/Produkt";
import { ProductsService } from "../../../main/products/products.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.sass",
})
export class ProductListComponent {
  datasource = new MatTableDataSource<Produkt>();
  displayedColumns = [
    "nazwa",
    "kcal",
    "bialka",
    "tluszcze",
    "weglowodany",
    "actions",
  ];
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private prodService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.prodService
      .initUser()
      .pipe(
        switchMap(() => this.prodService.getProdukts()),
        takeUntil(this.destroy$),
      )
      .subscribe((produkty: Produkt[]) => {
        produkty = produkty.sort((a, b) =>
          a.nazwaProduktu.localeCompare(b.nazwaProduktu),
        );

        this.datasource.data = produkty;

        console.log("Dane produktów zostały załadowane:", produkty);
      });

     this.datasource.paginator = this.paginator;
    this.paginator.pageSize = 10;
    this.paginator.pageIndex = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emitujemy zakończenie
    this.destroy$.complete(); // Zwalniamy Subject
  }
  optionsforProduct(mode: string, id: number): void {
    this.router.navigate(["../view", id], { relativeTo: this.route });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase(); // Normalizacja wartości filtru
  }
}
