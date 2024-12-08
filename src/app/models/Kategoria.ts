export interface Kategoria{
  id:number,
  nazwa:string
}

export interface KategorieResponse {
  data: Array<{
    id: number;
    attributes: {
      nazwakategori: string;
    };
  }>;
}

