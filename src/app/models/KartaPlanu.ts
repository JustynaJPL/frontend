import { Kategoria } from "./Kategoria";
import { PosilekMinimal } from "./PosilekMinimal";
import { PrzepisGeneracja } from "./PrzepisGeneracja";

export interface KartaPlanu{
  id:number;
  data:string;
  kategorie:Kategoria[]
  posilki: PrzepisGeneracja[]
}

