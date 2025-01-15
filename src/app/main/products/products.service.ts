import { catchError, map, Observable, of, tap } from 'rxjs';
import { response } from 'express';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Produkt } from '../../models/Produkt';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly ApiURL = 'http://localhost:1337/';
  private readonly productsURL = 'api/produkts/'

  getAuthOptions() {
    return {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    };
  }

  private produktySubject = new BehaviorSubject<Produkt[]>([]);
  public produkty$ = this.produktySubject.asObservable();

  constructor(private http:HttpClient) {
   }

   getProducts(): Observable<Produkt[]> {
    return this.http.get<{ data: any[] }>(this.ApiURL + this.productsURL, this.getAuthOptions())
      .pipe(
        map(response => this.parseProducts(response)),
        tap(products => this.produktySubject.next(products)),
        catchError(error => {
          console.error('Error fetching products', error);
          return of([]); // Zwraca pustą tablicę w przypadku błędu
        })
      );
  }

  private parseProducts(response: { data: any[] }): Produkt[] {
    if (!response.data) {
      throw new Error('Response format is incorrect or data is missing');
    }
    return response.data.map(item => ({
      id: item.id,
      nazwaProduktu: item.attributes.nazwaProduktu,
      kcal: item.attributes.kcal,
      tluszcze: item.attributes.tluszcze,
      weglowodany: item.attributes.weglowodany,
      bialko: item.attributes.bialko
    }));
  }

  // Dodatkowy getter dla BehaviorSubject, który zwraca Observable
  get produktyObservable(): Observable<Produkt[]> {
    return this.produktySubject.asObservable();
  }

  addProduct(product: Produkt): Observable<any> {
    const data = {
      data: {
          nazwaProduktu: product.nazwaProduktu,
          kcal: product.kcal,
          tluszcze: product.tluszcze,
          weglowodany: product.weglowodany,
          bialko: product.bialko
      }
    };
    return this.http.post(this.ApiURL + this.productsURL, data, this.getAuthOptions())
      .pipe(
        catchError(error => {
          console.error('Failed to add product', error);
          // Tutaj możesz dodać powiadomienie dla użytkownika
          alert('Nie udało się dodać produktu. Sprawdź logi dla szczegółów.');
          return of(null); // Kontynuacja strumienia bez przerywania aplikacji
        })
      )
      .pipe(
        map(() => {
          this.getProducts(); // Odświeżenie listy produktów
          return null;
        })
      );
  }

  editProduct(product: Produkt): Observable<Produkt[] | null> {
    const data = {
      data: {
          nazwaProduktu: product.nazwaProduktu,
          kcal: product.kcal,
          tluszcze: product.tluszcze,
          weglowodany: product.weglowodany,
          bialko: product.bialko
      }
    };

    // Zwracanie Observable zamiast tworzenia subskrypcji
    return this.http.put<Produkt[]>(this.ApiURL + this.productsURL + product.id, data, this.getAuthOptions())
      .pipe(
        catchError(error => {
          console.error('Failed to edit product', error);
          alert('Nie udało się edytować produktu. Sprawdź logi dla szczegółów.');
          return of(null); // Kontynuacja strumienia bez przerywania aplikacji
        }),
        tap(() => {
          this.getProducts(); // Odświeżenie listy produktów
        })
      );
  }


  deleteProduct(id: number): void {
    this.http.delete(this.ApiURL + this.productsURL + id, this.getAuthOptions())
      .pipe(
        catchError(error => {
          console.error('Failed to delete product', error);
          // Tutaj możesz dodać powiadomienie dla użytkownika
          alert('Nie udało się usunąć produktu. Sprawdź logi dla szczegółów.');
          return of(null); // Kontynuacja strumienia bez przerywania aplikacji
        })
      )
      .subscribe(() => {
        this.getProducts(); // Odświeżenie listy produktów
      });
  }

  getProductWithID(id: number): Observable<Produkt | null> {
    return this.http.get<{data: any}>(this.ApiURL + this.productsURL + id, this.getAuthOptions())
      .pipe(
        map(response => ({
          id: response.data.id,
          nazwaProduktu: response.data.attributes.nazwaProduktu,
          kcal: response.data.attributes.kcal,
          tluszcze: response.data.attributes.tluszcze,
          weglowodany: response.data.attributes.weglowodany,
          bialko: response.data.attributes.bialko
        })),
        catchError(error => {
          console.error('Failed to fetch product', error);
          // Tutaj możesz dodać powiadomienie dla użytkownika
          alert('Nie udało się pobrać produktu. Sprawdź logi dla szczegółów.');
          return of(null); // Kontynuacja strumienia bez przerywania aplikacji
        })
      );
  }

}
