import { Kategoria } from "./Kategoria";
import { PosilekMinimal } from "./PosilekMinimal";

export interface KartaPlanu{
  id:number;
  data:string;
  kategorie:Kategoria[]
  posilki: PosilekMinimal[]
}

