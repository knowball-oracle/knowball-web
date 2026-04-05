import { Game } from "./game.model";
import { Referee } from "./referee.model";
import { RefereeingRoleType } from "./refereeing-role.types";

export interface Refereeing {
  id?: { gameId: number; refereeId: number };
  role: RefereeingRoleType;
  game: Game;
  referee: Referee;
}
