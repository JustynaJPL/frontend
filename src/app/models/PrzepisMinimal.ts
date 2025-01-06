import { GDA } from "./GDA";

export interface PrzepisMinimal {
  id: number;
  imgUrl: string;
  gda: GDA;
  maxliczba_porcji: number;
}
