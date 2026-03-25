import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Produkt } from "../../models/Produkt";
import { ProduktApi } from "../../models/ProduktApi";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  private readonly ApiURL = "http://localhost:1337";
  private readonly productsURL = "/api/produkts";
  private readonly urlme = "/api/users/me";

  private currentUserId: number | null = null;
   private authopts = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  constructor(private http: HttpClient) {}

  // 🔐 Pobranie usera (opcjonalne)
  initUser(): Observable<number | null> {
    return this.http.get<any>(this.ApiURL + this.urlme, this.authopts).pipe(
      map((res) => {
        this.currentUserId = res.id;
        return res.id;
      }),
      catchError(() => {
        this.currentUserId = null;
        return of(null);
      }),
    );
  }

  // 📥 Pobranie produktów
  getProdukts(): Observable<Produkt[]> {
    let url = this.ApiURL + this.productsURL + "?populate=*";

    if (this.currentUserId) {
      url +=
        "&filters[$or][0][users_permissions_users][id][$notIn]=" +
        this.currentUserId +
        "&filters[$or][1][users_permissions_users][id][$null]=true";
    }

    return this.http.get<{ data: ProduktApi[] }>(url).pipe(
      map((response) =>
        response.data.map((item) => ({
          id: item.id,
          nazwaProduktu: item.attributes.nazwaProduktu,
          kcal: item.attributes.kcal,
          tluszcze: item.attributes.tluszcze,
          weglowodany: item.attributes.weglowodany,
          bialko: item.attributes.bialko,
        })),
      ),
      catchError((err) => {
        console.error("Błąd pobierania produktów:", err);
        return of([]);
      }),
    );
  }

  // ➕ Dodanie produktu
  addProdukt(product: Produkt): Observable<Produkt | null> {
    const body = {
      data: {
        nazwaProduktu: product.nazwaProduktu,
        kcal: product.kcal,
        tluszcze: product.tluszcze,
        weglowodany: product.weglowodany,
        bialko: product.bialko,
      },
    };

    return this.http
      .post<{ data: ProduktApi }>(this.ApiURL + this.productsURL, body)
      .pipe(
        map((res) => ({
          id: res.data.id,
          nazwaProduktu: res.data.attributes.nazwaProduktu,
          kcal: res.data.attributes.kcal,
          tluszcze: res.data.attributes.tluszcze,
          weglowodany: res.data.attributes.weglowodany,
          bialko: res.data.attributes.bialko,
        })),
        catchError(() => of(null)),
      );
  }

  // ✏️ Edycja produktu
  editProdukt(product: Produkt): Observable<Produkt | null> {
    const body = {
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
        this.ApiURL + this.productsURL + "/" + product.id,
        body,
      )
      .pipe(
        map((res) => ({
          id: res.data.id,
          nazwaProduktu: res.data.attributes.nazwaProduktu,
          kcal: res.data.attributes.kcal,
          tluszcze: res.data.attributes.tluszcze,
          weglowodany: res.data.attributes.weglowodany,
          bialko: res.data.attributes.bialko,
        })),
        catchError(() => of(null)),
      );
  }

  // ❌ "Usunięcie" (czyli przypisanie usera)
  deleteProdukt(id: number): Observable<any> {
    if (!this.currentUserId) return of(null);

    const body = {
      data: {
        users_permissions_users: {
          connect: [this.currentUserId],
        },
      },
    };

    return this.http.put(this.ApiURL + this.productsURL + "/" + id, body, this.authopts);
  }

  // 🔍 Pobranie jednego produktu
  getProduktWithID(id: number): Observable<Produkt | null> {
    return this.http
      .get<{ data: ProduktApi }>(this.ApiURL + this.productsURL + "/" + id)
      .pipe(
        map((res) => ({
          id: res.data.id,
          nazwaProduktu: res.data.attributes.nazwaProduktu,
          kcal: res.data.attributes.kcal,
          tluszcze: res.data.attributes.tluszcze,
          weglowodany: res.data.attributes.weglowodany,
          bialko: res.data.attributes.bialko,
        })),
        catchError(() => of(null)),
      );
  }
}
