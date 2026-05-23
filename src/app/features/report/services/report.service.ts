import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Report } from '../../../models/report.model';
import { ReportStatusType } from '../../../models/report-status.types';
import { AnalysisResultType } from '../../../models/analysis-result.types';
import { HateoasCollection } from '../../../shared/types/hateoas.types';

interface ReportRequest {
  game: { id: number };
  referee: { id: number };
  protocol: string;
  content: string;
  date: string;
  analysisResult?: AnalysisResultType;
}

interface ReportStatusRequest {
  status: ReportStatusType;
  analysisResult: AnalysisResultType | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private url = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Report[]> {
    return this.http
      .get<HateoasCollection<Report>>(this.url)
      .pipe(map((res) => res._embedded?.['reportList'] ?? []));
  }

  getById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.url}/${id}`);
  }

  getByStatus(status: ReportStatusType): Observable<Report[]> {
    return this.http
      .get<HateoasCollection<Report>>(`${this.url}/status/${status}`)
      .pipe(map((res) => res._embedded?.['reportList'] ?? []));
  }

  create(report: ReportRequest): Observable<Report> {
    return this.http.post<Report>(this.url, report);
  }

  updateStatus(id: number, body: ReportStatusRequest): Observable<Report> {
    return this.http.put<Report>(`${this.url}/${id}/status`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
