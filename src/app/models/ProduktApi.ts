export interface ProduktApi {
  id: number;
  attributes: {
    nazwaProduktu: string;
    kcal: number;
    tluszcze: number;
    weglowodany: number;
    cukier: number;
    bialko: number;
    blonnik: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}
