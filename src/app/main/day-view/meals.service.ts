import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Posilek } from "../../models/Posilek";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  throwError,
} from "rxjs";
import { GDA } from "../../models/GDA";
import { Kategoria, KategorieResponse } from "../../models/Kategoria";
import { switchMap, take, tap, finalize } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class MealsService {
  private readonly APIURL: string = "http://localhost:1337";
  private readonly posilkiUrl: string = "/api/posilki";
  private readonly kategorieUrl: string = "/api/kategories";
  private uid: number = 0;

  getAuthOptions() {
    return {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    };
  }

  private kategorieSubject = new BehaviorSubject<Kategoria[]>([]);
  public kategorie$ = this.kategorieSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadKategorie();

    // ustawienie daty przy pierwszym otwarciu
    const today = this.formatDate(new Date());
    this.currentDateSubject = new BehaviorSubject<string>(today);
    this.currentDate$ = this.currentDateSubject.asObservable();
  }

  public loadKategorie(): void {
    const requestUrl = `${this.APIURL}${this.kategorieUrl}?fields[1]=id&fields[2]=nazwakategori`;

    this.http
      .get<KategorieResponse>(requestUrl)
      .pipe(
        map((response) =>
          response.data.map((item) => ({
            id: item.id,
            nazwa: item.attributes.nazwakategori,
          }))
        ),
        catchError((error) => {
          console.error("Błąd podczas pobierania kategorii:", error);
          return throwError(
            () =>
              new Error(
                "Nie udało się pobrać kategorii. Spróbuj ponownie później."
              )
          );
        })
      )
      .subscribe({
        next: (kategorie: Kategoria[]) => this.kategorieSubject.next(kategorie),
        error: () => this.kategorieSubject.next([]), // W przypadku błędu ustaw pustą tablicę
      });
  }

  // Publiczna metoda do ręcznego odświeżenia danych
  public refreshKategorie(): void {
    this.loadKategorie();
  }

  // Metoda do uzyskania aktualnych kategorii jako Observable
  public getKategorie(): Observable<Kategoria[]> {
    return this.kategorie$;
  }

  private currentDateSubject: BehaviorSubject<string>;
  public currentDate$: Observable<string>;

  /**
   * Metoda do zmiany daty na nową wartość
   * @param newDate - nowa data jako string w formacie 'yyyy-MM-dd'
   */
  public setDate(newDate: string): void {
    this.currentDateSubject.next(newDate);
    this.loadPosilki();
  }

  public resetToToday(): void {
    const today = this.formatDate(new Date());
    this.currentDateSubject.next(today);
  }
  public getCurrData(): Observable<string> {
    return this.currentDate$;
  }

  /**
   * Pomocnicza metoda do formatowania Date do formatu 'yyyy-MM-dd'
   * @param date - obiekt Date
   * @returns - data w formacie 'yyyy-MM-dd'
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // http://localhost:1337/api/posilki?filters[user][id][$eq]=2&filters[data_posilku][$eq]=2024-08-31&fields[0]=id&fields[1]=ilosc_produktu&fields[2]=liczba_porcji_przepisu&populate[user][fields][0]=id&populate[kategoria][fields][0]=id&populate[przepis][fields][0]=id&populate[przepis][fields][1]=nazwaPrzepisu&populate[produkt][fields][0]=id&populate[produkt][fields][1]=nazwaProduktu&populate[posilekGDA]=*

  private posilkiSubject = new BehaviorSubject<Posilek[]>([]); // BehaviorSubject przechowujący posiłki
  public posilki$ = this.posilkiSubject.asObservable(); // Observable eksponujący dane

  public loadPosilki(): Observable<Posilek[]> {
    const userId = this.getUserId();

    if (!userId) {
      console.error("Nie można pobrać posiłków - brak userId");
      return of([]);
    }

    return combineLatest([of(userId), this.currentDate$])
      .pipe(
        take(1),
        switchMap(([userId, date]) =>
          this.http.get(this.createPosilekOfUserOfDataRequest(userId, date), this.getAuthOptions())
        ),
        map((apiResponse: any) => this.transformApiResponse(apiResponse)),
        tap((posilki) => this.posilkiSubject.next(posilki)), // Emituj nowe dane
        catchError((error) => {
          console.error("Błąd podczas pobierania posiłków:", error);
          return of([]);
        })
      );
  }


  private getUserId(): number | null {
    const userIdString = localStorage.getItem("userId");
    const userId = Number(userIdString);
    if (isNaN(userId)) {
      console.warn(`Nieprawidłowa wartość userId: ${userIdString}`);
      return null;
    }
    return userId;
  }

  private transformApiResponse(apiResponse: any): Posilek[] {
    return apiResponse.data.map((item: any) => {
      const { id, attributes } = item;
      const {
        ilosc_produktu,
        liczba_porcji_przepisu,
        user,
        kategoria,
        przepis,
        produkt,
        posilekGDA,
      } = attributes;

      return {
        id,
        nazwa: przepis?.data
          ? przepis?.data?.attributes?.nazwaPrzepisu ?? "Nieznany Przepis"
          : produkt?.data?.attributes?.nazwaProduktu ?? "Nieznany Produkt",
        data_posilku: new Date().toISOString().split("T")[0], // Przykładowo aktualna data
        userid: user?.data?.id ?? 0,
        idkategoria: kategoria?.data?.id ?? 0,
        idprzepis: przepis?.data?.id ?? undefined,
        idprodukt: produkt?.data?.id ?? undefined,
        ilosc_produktu: ilosc_produktu ?? undefined,
        liczba_porcji_przepisu: liczba_porcji_przepisu ?? undefined,
        posilekGDA: {
          id: posilekGDA.id ?? 0,
          kcal: posilekGDA.kcal ?? 0,
          bialka: posilekGDA.bialka ?? 0,
          tluszcze: posilekGDA.tluszcze ?? 0,
          weglowodany: posilekGDA.weglowodany ?? 0,
        },
      };
    });
  }

  createPosilekOfUserOfDataRequest(useridno: number, data: string): string {
    return `${this.APIURL}${this.posilkiUrl}?filters[user][id][$eq]=${useridno}&filters[data_posilku][$eq]=${data}&fields[0]=id&fields[1]=ilosc_produktu&fields[2]=liczba_porcji_przepisu&populate[user][fields][0]=id&populate[kategoria][fields][0]=id&populate[przepis][fields][0]=id&populate[przepis][fields][1]=nazwaPrzepisu&populate[produkt][fields][0]=id&populate[produkt][fields][1]=nazwaProduktu&populate[posilekGDA]=*`;
  }

  deletePosilekofId(id: number): void {
    this.http.delete(this.APIURL + this.posilkiUrl + '/' + id, this.getAuthOptions())
      .subscribe({
        next: () => {
          console.log('Element został usunięty:', id);
          // Automatyczne odświeżenie danych po usunięciu
          this.loadPosilki().subscribe((posilki) => {
            this.posilkiSubject.next(posilki); // Emituj nowe dane
          });
        },
        error: (error) => {
          console.error('Błąd podczas usuwania elementu:', error);
        }
      });
  }

   //pobranie konkretnego posiłku z bazy zakładając że uzytkownik ma do niego dostęp - jest to
   //zaopiekowane w ten sposób że zapytanie w poprzednim oknie wypisuje tylko te które dotyczą już tego uzytkownika
    //posilekid - to numer tego posiłku w tablicy posiłki w bazie danych unikalny dla każdego rekordu
   getPosilekofIdofUser(posilekid: number): Observable<any> {
    const url = `${this.APIURL}${this.posilkiUrl}?filters[id][$eq]=${posilekid}&fields[0]=id&fields[1]=ilosc_produktu&fields[2]=liczba_porcji_przepisu&populate[user][fields][0]=id&populate[kategoria][fields][0]=nazwakategori&populate[przepis][fields][0]=id&populate[przepis][fields][1]=nazwaPrzepisu&populate[produkt][fields][0]=id&populate[produkt][fields][1]=nazwaProduktu&populate[posilekGDA]=*`;

    return this.http.get(url).pipe(
      map((response: any) => {
        // Możesz dodatkowo przetworzyć odpowiedź, jeśli jest to wymagane
        return response.data[0] || null; // Załóżmy, że API zwraca dane w `data`
      }),
      catchError((error) => {
        console.error('Błąd podczas pobierania posiłku:', error);

        // Możesz dodać logikę w zależności od statusu błędu
        if (error.status === 404) {
          console.error('Nie znaleziono posiłku o podanym ID.');
        } else if (error.status === 401) {
          console.error('Brak autoryzacji do wykonania tego zapytania.');
        } else {
          console.error('Nieznany błąd.');
        }

        // Zwróć bardziej opisowy błąd lub rzuć go dalej
        return throwError(
          () =>
            new Error(
              'Nie udało się pobrać posiłku. Spróbuj ponownie później.'
            )
        );
      })
    );
  }


  // Aktualizacja posiłku w zakresie jaki jest edytowany w
  // sekcji edit-meal - w tym miejscu zmianiana jest tylko
  //ilosc składnika lub porcji i edytowane są wartości gda tylko!
  patchPosilekofID(id: number, data: any): Observable<any> {
    return this.http.put(this.APIURL + this.posilkiUrl + '/' + id, data, this.getAuthOptions()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obsługa błędów HTTP
   * @param error - Błąd typu HttpErrorResponse
   * @returns Observable z błędem
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Wystąpił nieoczekiwany błąd';
    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      errorMessage = `Błąd klienta: ${error.error.message}`;
    } else {
      // Błąd po stronie serwera
      errorMessage = `Błąd serwera: ${error.status} - ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
