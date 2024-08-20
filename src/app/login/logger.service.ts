import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MyData } from "../models/MyData";

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
}
