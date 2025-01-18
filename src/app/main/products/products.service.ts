import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Produkt } from '../../models/Produkt';
import { ProduktApi } from '../../models/ProduktApi';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly ApiURL = 'http://localhost:1337/';
  private readonly productsURL = 'api/produkts';

  // BehaviorSubject przechowujący listę produktów
  private produktySubject = new BehaviorSubject<Produkt[]>([]);
  public produkty$ = this.produktySubject.asObservable();

  constructor(private http: HttpClient) {
    this.getProdukts().subscribe();
  }

  // Opcje autoryzacji
  private getAuthOptions() {
    return {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };
  }

  /**
   * Pobranie wszystkich produktów
   */
  getProdukts(): Observable<Produkt[]> {
    return this.http.get<{ data: ProduktApi[] }>(this.ApiURL + this.productsURL, this.getAuthOptions())
      .pipe(
        map((response) => {
          const products = response.data.map((item) => ({
            id: item.id,
            nazwaProduktu: item.attributes.nazwaProduktu,
            kcal: item.attributes.kcal,
            tluszcze: item.attributes.tluszcze,
            weglowodany: item.attributes.weglowodany,
            bialko: item.attributes.bialko,
          }));
          this.produktySubject.next(products); // Emituj dane do BehaviorSubject
          return products;
        }),
        catchError((error) => {
          console.error('Error fetching products', error);
          return of([]);
        })
      );
  }



  /**
   * Dodanie nowego produktu
   */
  addProdukt(product: Produkt): Observable<Produkt | null> {
    const data = {
      data: {
        nazwaProduktu: product.nazwaProduktu,
        kcal: product.kcal,
        tluszcze: product.tluszcze,
        weglowodany: product.weglowodany,
        bialko: product.bialko,
      },
    };

    return this.http
      .post<{ data: ProduktApi }>(
        this.ApiURL + this.productsURL,
        data,
        this.getAuthOptions()
      )
      .pipe(
        map((response) => ({
          id: response.data.id,
          nazwaProduktu: response.data.attributes.nazwaProduktu,
          kcal: response.data.attributes.kcal,
          tluszcze: response.data.attributes.tluszcze,
          weglowodany: response.data.attributes.weglowodany,
          bialko: response.data.attributes.bialko,
        })),
        tap((newProduct) => {
          // Aktualizujemy lokalne dane natychmiast po dodaniu
          const currentProducts = this.produktySubject.value;
          this.produktySubject.next([...currentProducts, newProduct]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Edycja istniejącego produktu
   */
  editProdukt(product: Produkt): Observable<Produkt | null> {
    const data = {
      data: {
        nazwaProduktu: product.nazwaProduktu,
        kcal: product.kcal,
        tluszcze: product.tluszcze,
        weglowodany: product.weglowodany,
        bialko: product.bialko,
      },
    };

    return this.http
      .put<{ data: ProduktApi }>(
        this.ApiURL + this.productsURL + '/' + product.id,
        data,
        this.getAuthOptions()
      )
      .pipe(
        map((response) => ({
          id: response.data.id,
          nazwaProduktu: response.data.attributes.nazwaProduktu,
          kcal: response.data.attributes.kcal,
          tluszcze: response.data.attributes.tluszcze,
          weglowodany: response.data.attributes.weglowodany,
          bialko: response.data.attributes.bialko,
        })),
        tap((updatedProduct) => {
          // Aktualizujemy lokalne dane natychmiast po edycji
          const currentProducts = this.produktySubject.value.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          );
          this.produktySubject.next(currentProducts);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Usunięcie produktu
   */
  deleteProdukt(id: number): Observable<void> {
    return this.http
      .delete<void>(this.ApiURL + this.productsURL +'/'+ id, this.getAuthOptions())
      .pipe(
        tap(() => {
          // Aktualizujemy lokalne dane natychmiast po usunięciu
          const currentProducts = this.produktySubject.value.filter(
            (p) => p.id !== id
          );
          this.produktySubject.next(currentProducts);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Pobranie produktu o konkretnym ID
   */
  getProduktWithID(id: number): Observable<Produkt | null> {
    return this.http
      .get<{ data: ProduktApi }>(
        this.ApiURL + this.productsURL + '/' + id,
        this.getAuthOptions()
      )
      .pipe(
        map((response) => ({
          id: response.data.id,
          nazwaProduktu: response.data.attributes.nazwaProduktu,
          kcal: response.data.attributes.kcal,
          tluszcze: response.data.attributes.tluszcze,
          weglowodany: response.data.attributes.weglowodany,
          bialko: response.data.attributes.bialko,
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Centralna obsługa błędów HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Wystąpił błąd';
    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      errorMessage = `Błąd klienta: ${error.error.message}`;
    } else {
      // Błąd po stronie serwera
      errorMessage = `Błąd serwera (${error.status}): ${error.message}`;
    }
    console.error(errorMessage);
    alert(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
