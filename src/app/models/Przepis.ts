import { GDA } from "./GDA";

export interface Przepis {
  id: number;
  nazwaPrzepisu: string;
  instrukcja1: string;
  instrukcja2?: string;
  instrukcja3?: string;
  instrukcja4?: string;
  instrukcja5?: string;
  instrukcja6?: string;
  kategoria: {
    id:number;
    nazwa:string;
  }
  gda: GDA;
  imageurl?:string;
  imageId?:number;
  liczbaporcji:number;
  perPortion:GDA;
}
