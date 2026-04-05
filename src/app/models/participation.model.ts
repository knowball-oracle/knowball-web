import { Game } from "./game.model";
import { ParticipationType } from "./participation.types";
import { Team } from "./team.model";

export interface Participation {
  id?: { gameId: number; teamId: number };
  type: ParticipationType;
  game: Game;
  team: Team;
}
