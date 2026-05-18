import { AnalysisResultType } from "./analysis-result.types";
import { Game } from "./game.model";
import { Referee } from "./referee.model";
import { ReportStatusType } from "./report-status.types";

export interface Report {
  id?: number;
  game: Game;
  referee: Referee;
  protocol: string;
  content: string;
  date: string;
  status: ReportStatusType;
  analysisResult?: AnalysisResultType;
  canDelete?: boolean;
}
