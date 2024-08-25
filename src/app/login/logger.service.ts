import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { MyData } from "../models/MyData";
import { GDA } from "../models/GDA";
import { response } from "express";
import { FormControl, FormGroup } from "@angular/forms";
import { connect } from "http2";

@Injectable({
  providedIn: "root",
})
export class LoggerService {
  private authapi = "/api/auth/local";
  private _api = "http://localhost:1337";
  public get api() {
    return this._api;
  }
  public set api(value) {
    this._api = value;
  }
  private readonly urlme = "/api/users/me";
  private urlusers = "/api/users/";
  private univpopulateall = "?populate=*";

  private authopts = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  constructor(private http: HttpClient) {}

  login(credentials: { login: string; pass: string }): Observable<any> {
    const cred = { identifier: credentials.login, password: credentials.pass };
    return this.http.post<any>(this.api + this.authapi, cred);
  }

  logout(): void {
    localStorage.removeItem("token");
  }

  isLoggedIn(): boolean {
    return localStorage.getItem("token") !== null;
  }

  getMyData(): Observable<MyData> {
    return this.http
      .get(this.api + this.urlme + this.univpopulateall, this.authopts)
      .pipe(
        map((response: any) => {
          let d: MyData = {
            id: response.id,
            name: response.name,
            email: response.email,
            gender: response.gender,
            height: response.height,
            birth: new Date(response.birth),
            sport: response.sport,
            avatar: response.avatar.formats.medium.url,
            avatarid: response.avatar.id,
          };
          return d;
        })
      );
  }

  updateMyData(data: MyData): Observable<boolean> {
    console.log(data);

    const requests: Observable<any>[] = [
      this.http.put(`${this.api}${this.urlusers}${data.id}`, { name: data.name }, this.authopts),
      this.http.put(`${this.api}${this.urlusers}${data.id}`, { email: data.email }, this.authopts),
      this.http.put(`${this.api}${this.urlusers}${data.id}`, { gender: data.gender }, this.authopts),
      this.http.put(`${this.api}${this.urlusers}${data.id}`, { height: data.height }, this.authopts),
      this.http.put(`${this.api}${this.urlusers}${data.id}`, { birth: data.birth }, this.authopts),
      this.http.put(`${this.api}${this.urlusers}${data.id}`, { sport: data.sport }, this.authopts),
      this.http.put(`${this.api}${this.urlusers}${data.id}`,
        {
        avatar: {
          id: data.avatarid
        },
        }, this.authopts),
    ];

    return forkJoin(requests).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error updating data:', error);
        return of(false);
      })
    );
  }



  getgenders(): Observable<string[]> {
    return this.http.get<string[]>(this.api + "/api/user/gender");
  }
  getsport(): Observable<string[]> {
    return this.http.get<string[]>(this.api + "/api/user/sport");
  }

  getGda(): Observable<GDA> {
    return this.http
      .get<GDA>(this.api + this.urlme + this.univpopulateall, this.authopts)
      .pipe(
        map((response: any) => {
          let g: GDA = {
            kcal: response.gda.kcal,
            bialka: response.gda.bialka,
            weglowodany: response.gda.weglowodany,
            tluszcze: response.gda.tluszcze,
          };
          return g;
        })
      );
  }

  updateGDA(newGda: GDA, uID: number): Observable<any> {
    return this.http.put(
      this.api + this.urlusers + uID,
      {
        gda: {
          kcal: newGda.kcal,
          bialka: newGda.bialka,
          tluszcze: newGda.tluszcze,
          weglowodany: newGda.weglowodany,
        },
      },
      this.authopts
    );
  }

  getUserDBID(): Observable<any> {
    return this.http.get<any>(this.api + this.urlme, this.authopts).pipe(
      map((response: any) => {
        return response.id;
      })
    );
  }
}
