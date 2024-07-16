import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Przepis } from "../models/Przepis";
// import axios from 'axios';
// import {AxiosResponse} from 'axios';

@Injectable({
  providedIn: "root",
})
export class DatabaseConnectorService {
  private _APIURL: string = "http://localhost:1337";
  private przepisurl: string = "/api/przepisy";
  private kategoriaurl: string = "/api/kategories";
  private posilekurl: string = "/api/posilki";
  private skladnikurl: string = "/api/skladniks";
  private wagaurl: string = "/api/wagas";
  private uploadurl: string = "/api/upload/files";

  public get APIURL(): string {
    return this._APIURL;
  }
  public set APIURL(value: string) {
    this._APIURL = value;
  }

  private authopts = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  constructor(private http: HttpClient) {}

  // <--- login code block here

  // <--- login code block here

  // recipes code
  getAllrecipes(): Observable<Przepis[]> {
    return this.http.get(this._APIURL+this.przepisurl+'?populate=*', this.authopts).pipe(
      map((data: any) => {
        // console.log(data);
        let recipes: Przepis[] = [];
        for (let i = 0; i < data.data.length; i++) {
          let p: Przepis = {
            id: data.data[i].id,
            nazwaPrzepisu: data.data[i].attributes.nazwaPrzepisu,
            instrukcja1: data.data[i].attributes.instrukcja1,
            instrukcja2: data.data[i].attributes.instrukcja2
              ? data.data[i].attributes.instrukcja2
              : "",
            instrukcja3: data.data[i].attributes.instrukcja3
              ? data.data[i].attributes.instrukcja3
              : "",
            instrukcja4: data.data[i].attributes.instrukcja4
              ? data.data[i].attributes.instrukcja4
              : "",
            instrukcja5: data.data[i].attributes.instrukcja5
              ? data.data[i].attributes.instrukcja5
              : "",
            instrukcja6: data.data[i].attributes.instrukcja6
              ? data.data[i].attributes.instrukcja6
              : "",
            kategoria: {
              id:data.data[i].attributes.kategoria.data.id,
              nazwa: data.data[i].attributes.kategoria.data.attributes.nazwakategori,
                },
            gda: {
              kcal: data.data[i].attributes.gda.kcal,
              bialka: data.data[i].attributes.gda.bialka,
              tluszcze: data.data[i].attributes.gda.tluszcze,
              weglowodany: data.data[i].attributes.gda.weglowodany,
            },
          };
          recipes.push(p);
        }
        return recipes;
      })
    );
  }

  deleteRecipeWithId(id: number): Observable<any> {
    return this.http.delete(this.APIURL + this.przepisurl + id,
      this.authopts
    );
  }
}
