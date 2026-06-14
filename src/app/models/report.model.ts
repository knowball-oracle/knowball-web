import { AnalysisResultType } from "./analysis-result.types";
import { Game } from "./game.model";
import { Referee } from "./referee.model";
import { ReportStatusType } from "./report-status.types";

export interface ReportUser {
  id: number;
  name?: string;
  email?: string;
}

export interface Report {
  id?: number;
  game: Game;
  referee: Referee;
  user?: ReportUser;
  protocol: string;
  content: string;
  date: string;
  status: ReportStatusType;
  analysisResult?: AnalysisResultType;
  canDelete?: boolean;
}
