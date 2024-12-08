export interface ApiResponse {
  data: {
    id: number;
    attributes: {
      ilosc_produktu: number | null;
      liczba_porcji_przepisu: number | null;
      user: {
        data: {
          id: number;
          attributes: {};
        }
      };
      kategoria: {
        data: {
          id: number;
          attributes: {};
        }
      };
      przepis: {
        data?: {
          id: number;
          attributes: {
            nazwaPrzepisu: string;
          }
        };
      };
      produkt: {
        data?: {
          id: number;
          attributes: {
            nazwaProduktu: string;
          }
        };
      };
      posilekGDA: {
        id: number;
        kcal: number;
        bialka: number;
        tluszcze: number;
        weglowodany: number;
      };
    }[];
  };
}
