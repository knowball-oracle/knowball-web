import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { HateoasCollection } from "../../../shared/types/hateoas.types";
import { Referee } from "../../../models/referee.model";

@Injectable({
  providedIn: 'root'
})
export class RefereeService {
  private url = `${environment.apiUrl}/referees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Referee[]> {
    return this.http
      .get<HateoasCollection<Referee>>(this.url)
      .pipe(map(res => res._embedded?.['refereeList'] ?? []));
  }

  getById(id: number): Observable<Referee> {
    return this.http.get<Referee>(`${this.url}/${id}`);
  }

  create(referee: Referee): Observable<Referee> {
    return this.http.post<Referee>(this.url, referee);
  }

  update(id: number, referee: Referee): Observable<Referee> {
    return this.http.put<Referee>(`${this.url}/${id}`, referee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
