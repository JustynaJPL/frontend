import { connect } from "http2";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Posilek } from "../../models/Posilek";
import { BehaviorSubject, catchError, map, Observable, throwError } from "rxjs";
import { GDA } from "../../models/GDA";

@Injectable({
  providedIn: "root",
})
export class MealsService {
  private readonly APIURL: string = "http://localhost:1337";
  private readonly posilkiurl: string = "/api/posilki";
  private uid: number;

  getAuthOptions() {
    return {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    };
  }

  private selectedDate: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('selectedDate') || this.dayToday()
);
public selectedDate$: Observable<string> = this.selectedDate.asObservable();


  private gdaDataSubject: BehaviorSubject<GDA[]> = new BehaviorSubject<GDA[]>([]);
  public gdaData$: Observable<GDA[]> = this.gdaDataSubject.asObservable();


  // observable zmiennych dla modułu day-view
  private breakfastToday: BehaviorSubject<Posilek[]>; //datasubject
  public breakfast$: Observable<Posilek[]>;
  private lunchToday: BehaviorSubject<Posilek[]>; //datasubject
  public lunch$: Observable<Posilek[]>;
  private dinnerToday: BehaviorSubject<Posilek[]>; //datasubject
  public dinner$: Observable<Posilek[]>;
  private supperToday: BehaviorSubject<Posilek[]>; //datasubject
  public supper$: Observable<Posilek[]>;

  constructor(private http: HttpClient) {
    this.uid = Number.parseInt(localStorage.getItem("userId")!);

    this.breakfastToday = new BehaviorSubject<Posilek[]>([]);
    this.breakfast$ = this.breakfastToday.asObservable();

    this.lunchToday = new BehaviorSubject<Posilek[]>([]);
    this.lunch$ = this.lunchToday.asObservable();

    this.dinnerToday = new BehaviorSubject<Posilek[]>([]);
    this.dinner$ = this.dinnerToday.asObservable();

    this.supperToday = new BehaviorSubject<Posilek[]>([]);
    this.supper$ = this.supperToday.asObservable();

    this.getAllUserPosilki(this.uid, this.selectedDate.getValue());

  }

  public updateSelectedDate(newDate: string): void {
    this.selectedDate.next(newDate);
    this.refreshPosilki();
    this.getAllUserGDAofPosilkiofDay();
  }

  public get selectedDateValue(): string {
    return this.selectedDate.value;
  }

  public set selectedDateValue(newDate: string) {
    this.selectedDate.next(newDate);
    this.refreshPosilki(); // automatyczne odświeżenie danych po zmianie daty
  }


  // Funkcja formatowania daty
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }




  addPosilek(posilek: Posilek) {
    let body: any;
    body = this.posilektoDBPosilek(posilek);

    this.http.post(this.APIURL + this.posilkiurl, body, this.getAuthOptions())
      .pipe(
        catchError(error => {
          console.error('Błąd podczas dodawania posilku:', error);
          return throwError(() => new Error('Nie udało się dodać posiłku. Spróbuj ponownie później.'));
        })
      )
      .subscribe(
        (addedData: any) => {
          const currentData = this.getBehaviorSubjectForCategory(posilek.idkategoria).value;
          this.getBehaviorSubjectForCategory(posilek.idkategoria).next([...currentData, this.transformToPosilek(addedData)]);
        }
      );
  }


  private getBehaviorSubjectForCategory(kategoriaId: number): BehaviorSubject<Posilek[]> {
    switch (kategoriaId) {
      case 1: return this.breakfastToday;
      case 2: return this.lunchToday;
      case 3: return this.dinnerToday;
      case 4: return this.supperToday;
      default: throw new Error("Niepoprawne ID kategorii");
    }
  }

  private refreshPosilki(): void {
    const uid = this.uid;
    const date = this.selectedDate.value;
    this.getAllUserPosilki(uid, this.selectedDate.value);
  }

  updatePosilki(posilek:Posilek){
    this.http.put(this.APIURL + this.posilkiurl , this.posilektoDBPosilek(posilek),this.getAuthOptions())
    .subscribe(
      (updatedDataResponse: any) => {
        if(posilek.idkategoria==1){
          const currentData = this.breakfastToday.value.map(item =>
            item.id === updatedDataResponse.id ? updatedDataResponse : item
          );
          this.breakfastToday.next(currentData);
        }
        if(posilek.idkategoria==2){
          const currentData = this.lunchToday.value.map(item =>
            item.id === updatedDataResponse.id ? updatedDataResponse : item
          );
          this.lunchToday.next(currentData);
        }
        if(posilek.idkategoria==3){
          const currentData = this.dinnerToday.value.map(item =>
            item.id === updatedDataResponse.id ? updatedDataResponse : item
          );
          this.dinnerToday.next(currentData);
        }
        if(posilek.idkategoria==4){
          const currentData = this.supperToday.value.map(item =>
            item.id === updatedDataResponse.id ? updatedDataResponse : item
          );
          this.supperToday.next(currentData);
        }
        else{
          console.error('Błąd z kategorią')
        }

      },
      (error) => console.error('Błąd podczas aktualizacji danych', error)
    );
  }

  private posilektoDBPosilek(posilek: Posilek):any {
    let body:any;
    if (posilek.idprzepis) {
      body = {
        data: {
          data_posilku: posilek.data_posilku,
          user: {
            id:{
              connect: [posilek.userid]
          }},
          kategoria: {
            connect: [posilek.idkategoria],
          },
          przepis: {
            connect: [posilek.idprzepis],
          },
          liczba_porcji_przepisu: posilek.liczba_porcji_przepisu,
          posilekGDA: {
            kcal: posilek.posilekGDA.kcal,
            bialka: posilek.posilekGDA.bialka,
            tluszcze: posilek.posilekGDA.tluszcze,
            weglowodany: posilek.posilekGDA.weglowodany,
          },
        },
      };
    } else {
      body = {
        data: {
          data_posilku: posilek.data_posilku,
          user: {
            connect: [posilek.userid],
          },
          kategoria: {
            connect: [posilek.idkategoria],
          },
          produkt: {
            connect: [posilek.idprodukt],
          },
          ilosc_produktu: posilek.ilosc_produktu,
          liczba_porcji_przepisu: posilek.liczba_porcji_przepisu,
          posilekGDA: {
            kcal: posilek.posilekGDA.kcal,
            bialka: posilek.posilekGDA.bialka,
            tluszcze: posilek.posilekGDA.tluszcze,
            weglowodany: posilek.posilekGDA.weglowodany,
          },
        },
      };
    }
    return body;
  }

  getAllUserPosilki(uid: number, date: string) {
    this.http
      .get(
        `${this.APIURL}${this.posilkiurl}?filters[user][id][$eq]=${uid}&filters[data_posilku][$eq]=${date}&populate=*`,
        this.getAuthOptions()
      )
      .subscribe(
        (response: any) => {
          const posilki: Posilek[] = response.data.map((item: any) => this.transformToPosilek(item));

          // Rozdzielenie danych na poszczególne kategorie
          const breakfast = posilki.filter(p => p.idkategoria == 1);
          const lunch = posilki.filter(p => p.idkategoria == 2);
          const dinner = posilki.filter(p => p.idkategoria == 3);
          const supper = posilki.filter(p => p.idkategoria == 4);

          this.breakfastToday.next(breakfast);
          this.lunchToday.next(lunch);
          this.dinnerToday.next(dinner);
          this.supperToday.next(supper);
        },
        (error) => console.error("Błąd podczas pobierania danych", error)
      );
  }

  private transformToPosilek(item: any): Posilek {
    return {
      id: item.id,
      nazwa:
        item.attributes.przepis?.data?.attributes?.nazwaPrzepisu ||
        item.attributes.produkt?.data?.attributes?.nazwaProduktu ||
        "Brak nazwy", // Przypisanie nazwy przepisu lub wartości domyślnej
      data_posilku: item.attributes.data_posilku,
      userid: item.attributes.user.data.id,
      idkategoria: item.attributes.kategoria.data.id.toString(),
      idprzepis: item.attributes.przepis?.data?.id || undefined,
      idprodukt: item.attributes.produkt?.data?.id || undefined,
      ilosc_produktu: item.attributes.ilosc_produktu || undefined,
      liczba_porcji_przepisu:
        item.attributes.liczba_porcji_przepisu || undefined,
      posilekGDA: {
        kcal: item.attributes.posilekGDA.kcal,
        bialka: item.attributes.posilekGDA.bialka,
        tluszcze: item.attributes.posilekGDA.tluszcze,
        weglowodany: item.attributes.posilekGDA.weglowodany,
      },
    };
  }

  dayToday(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
    const year = today.getFullYear();

    return `${year}-${month}-${day}`;
  }

  getAllUserGDAofPosilkiofDay(): void {
    const date = this.selectedDate.value; // Pobieramy aktualną wartość daty z BehaviorSubject

    this.http.get(
      this.APIURL + this.posilkiurl +
      '?filters[user][id][$eq]=' + this.uid +
      '&filters[data_posilku][$eq]=' + date +
      '&populate[posilekGDA][fields][0]=kcal' +
      '&populate[posilekGDA][fields][1]=bialka' +
      '&populate[posilekGDA][fields][2]=weglowodany' +
      '&populate[posilekGDA][fields][3]=tluszcze',
      this.getAuthOptions()
    ).pipe(
      map((response: any) => {
        return response.data.map((item: any) => {
          const posilekGDA = item.attributes.posilekGDA;
          return {
            kcal: posilekGDA.kcal,
            bialka: posilekGDA.bialka,
            tluszcze: posilekGDA.tluszcze,
            weglowodany: posilekGDA.weglowodany
          } as GDA;
        });
      }),
      catchError(error => {
        console.error('Błąd podczas pobierania danych posiłków:', error);
        return throwError(() => new Error('Nie udało się pobrać danych. Spróbuj ponownie później.'));
      })
    ).subscribe((gdaValues: GDA[]) => {
      // Zaktualizuj BehaviorSubject
      this.gdaDataSubject.next(gdaValues);
    });
  }

}

