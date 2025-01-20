import { Component, ViewChild } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, forkJoin, map, Observable, of, Subject } from 'rxjs';
import { MealsService } from '../meals.service';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { Zakup } from '../../../models/Zakup';
import { DatabaseConnectorService } from '../../../database-services/database-connector.service';
import { Skladnik } from '../../../models/Skladnik';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'app-shopping-list',
    standalone: true,
    templateUrl: './shopping-list.component.html',
    styleUrl: './shopping-list.component.sass',
    imports: [
      CommonModule,
      MatCardModule,
      MatButtonModule,
      MatFormFieldModule,
      MatDatepickerModule,
      AppNaviComponent,
      MatTableModule,
      MatNativeDateModule,
      MatInputModule,
      MatIconModule,
      MatPaginatorModule
    ]
})
export class ShoppingListComponent {

  posilkiDaneSurowe:any[]=[];
  datasource = new MatTableDataSource<Zakup>;

    public selectedDateValue$: Observable<string>;
     private destroy$ = new Subject<void>();

    displayedColumns: string[] = [
      "name",
      "weightOrPortions"
    ];

    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

    constructor(private meals:MealsService, private location:Location, private db:DatabaseConnectorService ){
      this.selectedDateValue$ = this.meals.currentDate$;
    }

    ngOnInit(): void {
      // Pierwsza sekcja: Pobranie danych z API
      this.retrieveDataFromDB();
      this.datasource.paginator = this.paginator;
      this.paginator.pageSize = 10; // Liczba elementów na stronę
      this.paginator.pageIndex = 0;
    }

    private retrieveDataFromDB() {
    this.meals
      .getPosilkiofCurrentDate()
      .pipe(
        catchError((error) => {
          console.error('Błąd podczas pobierania posiłków:', error);
          return of([]); // Zwracamy pustą tablicę w przypadku błędu
        })
      )
      .subscribe((response) => {
        this.datasource.data.splice(0);
        this.datasource._updateChangeSubscription();
        this.posilkiDaneSurowe = response;
        console.log('Odebrane posiłki:', response);

        // Przetwarzanie danych z pierwszej sekcji
        for (let i = 0; i < this.posilkiDaneSurowe.length; i++) {
          if (this.posilkiDaneSurowe[i].ilosc_produktu != null) {
            let p: Zakup = {
              id: i,
              nazwa: this.posilkiDaneSurowe[i].nazwaProduktu,
              waga: this.posilkiDaneSurowe[i].ilosc_produktu,
            };
            this.datasource.data.push(p);
            this.datasource._updateChangeSubscription();
          }
        }

        // Przejście do drugiej sekcji
        this.processSecondSection();
      });
    }

    processSecondSection(): void {
      // Filtrujemy tylko elementy z idPrzepisu
      const requests = this.posilkiDaneSurowe
        .filter((item) => item.idPrzepisu != null)
        .map((item) =>
          this.db.getSkladniksofRecipeWithId(item.idPrzepisu).pipe(
            map((response: Skladnik[]) =>
              response.map((skladnik) => ({
                nazwa: skladnik.nazwaProduktu,
                waga:
                  (skladnik.ilosc * item.liczba_porcji_przepisu) /
                  item.liczbaMaxPorcjiPrzepisu,
              }))
            ),
            catchError((error) => {
              console.error(
                `Błąd podczas pobierania składników dla przepisu ${item.idPrzepisu}:`,
                error
              );
              return of([]); // Zwracamy pustą tablicę w przypadku błędu
            })
          )
        );

      // Uruchamiamy wszystkie żądania równolegle za pomocą forkJoin
      forkJoin(requests).subscribe(
        (results: Zakup[][]) => {
          results.forEach((zakupy) => {
            zakupy.forEach((zakup) => {
              this.datasource.data.push(zakup);
            });
          });
          this.datasource._updateChangeSubscription();
          console.log('Przetwarzanie drugiej sekcji zakończone.');
        },
        (error) => {
          console.error('Błąd podczas przetwarzania drugiej sekcji:', error);
        }
      );
    }

    onDateChange($event: MatDatepickerInputEvent<any, any>) {
        const date:string = this.meals.formatDate($event.target.value);
        this.meals.setDate(date);
        this.retrieveDataFromDB();
      }

    ngOnDestroy() {
      // Zakończ subskrypcję, gdy komponent zostanie zniszczony
      this.destroy$.next();
      this.destroy$.complete();
    }

    cancel() {
      this.location.back();
    }

}
