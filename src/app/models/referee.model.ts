import { RefereeStatusType } from "./referee-status.types";

export interface Referee {
  id?: number;
  name: string;
  birthDate: string;
  status: RefereeStatusType;
}
