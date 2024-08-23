import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MyData } from "../models/MyData";
import { GDA } from "../models/GDA";
import { response } from "express";

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
  private urlusers = '/api/users/';
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
            name: response.name,
            email: response.email,
            gender: response.gender,
            height: response.height,
            birth: new Date(response.birth),
            sport: response.sport,
            avatar: response.avatar.formats.medium.url,
          };
          return d;
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
    return this.http.get<GDA>(this.api+this.urlme+this.univpopulateall,this.authopts).pipe(
      map((response:any) => {
        let g:GDA = {
          kcal:response.gda.kcal,
          bialka:response.gda.bialka,
          weglowodany:response.gda.weglowodany,
          tluszcze:response.gda.tluszcze
        };
        return g;
      })
    )
  }

  updateGDA(newGda:GDA, uID:number):Observable<any>{
    return this.http.put(this.api + this.urlusers + uID ,
      {
        gda:{
          kcal:newGda.kcal,
          bialka:newGda.bialka,
          tluszcze: newGda.tluszcze,
          weglowodany:newGda.weglowodany
        }
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
