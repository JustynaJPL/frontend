import { connect } from "http2";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Posilek } from "../../models/Posilek";
import { BehaviorSubject, catchError, map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MealsService {
  private readonly APIURL: string = "http://localhost:1337";
  private readonly posilkiurl: string = "/api/posilki";
  private authopts = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };
  private uid: number;

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
    this.lunch$ = this.breakfastToday.asObservable();

    this.dinnerToday = new BehaviorSubject<Posilek[]>([]);
    this.dinner$ = this.breakfastToday.asObservable();

    this.supperToday = new BehaviorSubject<Posilek[]>([]);
    this.supper$ = this.breakfastToday.asObservable();

    this.getAllUserPosilkiofKategoria(this.uid, this.dayToday(), 1);
    this.getAllUserPosilkiofKategoria(this.uid, this.dayToday(), 2);
    this.getAllUserPosilkiofKategoria(this.uid, this.dayToday(), 3);
    this.getAllUserPosilkiofKategoria(this.uid, this.dayToday(), 4);
  }

  addPosilek(posilek: Posilek) {
    let body:any;
    body = this.posilektoDBPosilek(posilek);

    this.http.post(this.APIURL + this.posilkiurl,body,this.authopts)
    .subscribe(
      (addedData: any) => {
        if(posilek.idkategoria==1){
        const currentData = this.breakfastToday.value;
        this.breakfastToday.next([...currentData, this.transformToPosilek(addedData)]);
        }
        if(posilek.idkategoria==2){
          const currentData = this.lunchToday.value;
          this.lunchToday.next([...currentData, this.transformToPosilek(addedData)]);
        }
        if(posilek.idkategoria==3){
          const currentData = this.dinnerToday.value;
          this.dinnerToday.next([...currentData, this.transformToPosilek(addedData)]);
        }
        if(posilek.idkategoria==4){
          const currentData = this.supperToday.value;
          this.supperToday.next([...currentData, this.transformToPosilek(addedData)]);
        }
        else{
          console.log("Problem z kategoria id");
        }
      },
      (error) => console.error('Błąd podczas dodawania posilku w komponencie' + posilek.idkategoria, error)
    );
  }

  updatePosilki(posilek:Posilek){
    this.http.put(this.APIURL + this.posilkiurl , this.posilektoDBPosilek(posilek),this.authopts)
    .subscribe(
      (updatedDataResponse: any) => {
          const currentData = this.dataSubject.value.map(item =>
          item.id === updatedDataResponse.id ? updatedDataResponse : item
        );
        this.dataSubject.next(currentData);
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
            connect: [posilek.userid],
          },
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

  getAllUserPosilkiofKategoria(uid: number, date: string, kat: number) {
    this.http
      .get(
        this.APIURL +
          this.posilkiurl +
          "?filters[user][id][$eq]=" +
          uid +
          "&filters[data_posilku][$eq]=" +
          date +
          "&filters[kategoria][id][$eq]=" +
          kat +
          "&populate=*",
        this.authopts
      )
      .subscribe(
        (response: any) => {
          const posilki: Posilek[] = response.data.map((item: any) =>
            this.transformToPosilek(item)
          );
          if (kat == 1) this.breakfastToday.next(posilki);
          if (kat == 2) this.lunchToday.next(posilki);
          if (kat == 3) this.dinnerToday.next(posilki);
          if (kat == 4) this.supperToday.next(posilki);
        },
        (error) => console.error("Błąd podczas pobierania danych", error)
      );
  }

  private transformToPosilek(item: any): Posilek {
    return {
      id: item.id,
      nazwa:
        item.attributes.przepis?.data?.attributes?.nazwaPrzepisu ||
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
}

