import { Championship } from "./championship.model";

export interface Game {
  id?: number;
  championship: Championship;
  matchDate: string;
  place: string;
  homeScore: number;
  awayScore: number;
}
