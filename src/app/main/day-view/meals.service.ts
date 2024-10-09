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
  private uid: number = 0;

  getAuthOptions() {
    return {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    };
  }


}

