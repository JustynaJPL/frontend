import { catchError, map, Observable, of } from 'rxjs';
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
    this.getProducts();
   }

   getProducts(): void {
    this.http.get<{data: any[]}>(this.ApiURL + this.productsURL, this.getAuthOptions())
      .pipe(
        map(response => response.data.map(item => ({
          id: item.id,
          nazwaProduktu: item.attributes.nazwaProduktu,
          kcal: item.attributes.kcal,
          tluszcze: item.attributes.tluszcze,
          weglowodany: item.attributes.weglowodany,
          bialko: item.attributes.bialko
        }))),
        catchError(error => {
          console.error('Error fetching products', error);
          return of([]); // Zwraca pustą tablicę w przypadku błędu
        })
      );
      // .subscribe(products => {
      //   console.log('Fetched products', products);
      //   this.produktySubject.next(products); // Aktualizacja BehaviorSubject
      // });
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

  editProduct(product: Produkt): void {
    const data = {
      data: {
          nazwaProduktu: product.nazwaProduktu,
          kcal: product.kcal,
          tluszcze: product.tluszcze,
          weglowodany: product.weglowodany,
          bialko: product.bialko
      }
    };
    this.http.put(this.ApiURL + this.productsURL + product.id, data, this.getAuthOptions())
      .pipe(
        catchError(error => {
          console.error('Failed to edit product', error);
          // Tutaj możesz dodać powiadomienie dla użytkownika
          alert('Nie udało się edytować produktu. Sprawdź logi dla szczegółów.');
          return of(null); // Kontynuacja strumienia bez przerywania aplikacji
        })
      )
      .subscribe(() => {
        this.getProducts(); // Odświeżenie listy produktów
      });
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

}
