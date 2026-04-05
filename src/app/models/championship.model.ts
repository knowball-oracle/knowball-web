import { ChampionshipCategoryType } from "./championship-category.types";

export interface Championship {
  id?: number;
  name: string;
  category: ChampionshipCategoryType;
  year: number;
}
