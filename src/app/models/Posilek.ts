export interface Posilek{
  id:number;
  nazwa:string;
  data_posilku:string;
  userid:number;
  idkategoria:number;
  idprzepis?:number;
  idprodukt?:number;
  ilosc_produktu?:number;
  liczba_porcji_przepisu?:number;
  posilekGDA:{
    kcal:number;
    bialka:number;
    tluszcze:number;
    weglowodany:number;
  }
}
