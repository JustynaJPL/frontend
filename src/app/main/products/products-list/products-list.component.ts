import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Produkt } from '../../../models/Produkt';
import { ProductsService } from '../products.service';
import { catchError, Observable, Subject, takeUntil } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-products-list',
    standalone: true,
    templateUrl: './products-list.component.html',
    styleUrl: './products-list.component.sass',
    imports: [AppNaviComponent,
      CommonModule,
      MatTableModule,
      MatButtonModule,
      MatIconModule,
      MatPaginatorModule,
      MatFormFieldModule,
      MatInputModule
    ]
})
export class ProductsListComponent implements OnInit, OnDestroy {
  datasource = new MatTableDataSource<Produkt>();
  private destroy$ = new Subject<void>();
  displayedColumns = [
    'nazwa',
    'kcal',
    'bialka',
    'tluszcze',
    'weglowodany',
    'actions',
  ];

  macroColumns: string[] = ['nazwa', 'makroskladniki', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private prodService: ProductsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // Subskrybujemy produkty i aktualizujemy tabelę
    this.prodService.produkty$
      .pipe(takeUntil(this.destroy$)) // Automatyczne zakończenie subskrypcji
      .subscribe(
        (produkty:Produkt[]) => {
          produkty = produkty.sort((a, b) => a.nazwaProduktu.localeCompare(b.nazwaProduktu));
          this.datasource.data = produkty; // Aktualizacja danych w tabeli
          console.log('Dane produktów zostały zaktualizowane:', produkty);
        }
      );

    // Konfiguracja paginatora
    this.datasource.paginator = this.paginator;
    this.paginator.pageSize = 10; // Liczba elementów na stronę
    this.paginator.pageIndex = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emitujemy zakończenie
    this.destroy$.complete(); // Zwalniamy Subject
  }

  /**
   * Obsługa akcji na produkcie (edycja, usuwanie, widok)
   * @param mode - Akcja do wykonania ('edit', 'delete', 'view')
   * @param id - ID produktu
   */
  optionsforProduct(mode: string, id: number): void {
    switch (mode) {
      case 'edit':
        // Nawigacja do edycji produktu
        this.router.navigate(['/logged/products/', 'edit', id]);
        break;
      case 'delete':
        // Usuwanie produktu
        this.prodService.deleteProdukt(id).subscribe({
          next: () => {
            console.log(`Produkt o ID ${id} został usunięty.`);
            // Lista produktów zostanie automatycznie zaktualizowana
          },
          error: (err) => {
            console.error('Błąd podczas usuwania produktu:', err);
            alert('Nie udało się usunąć produktu. Sprawdź logi.');
          },
        });
        break;
        case 'new':
          this.router.navigate(['logged/products/new']);
        break;
      default:
        // Nawigacja do widoku szczegółowego
        this.router.navigate(['/logged/products/', 'view', id]);
        break;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase(); // Normalizacja wartości filtru
  }
}
