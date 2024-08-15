
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
  gda: {
    kcal: number;
    bialka: number;
    tluszcze: number;
    weglowodany: number;
  };
  imageurl?:string;
  imageId?:number;
  liczbaporcji:number;
}
