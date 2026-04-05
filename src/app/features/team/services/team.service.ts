import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { HateoasCollection } from "../../../shared/types/hateoas.types"
import { Team } from "../../../models/team.model";

@Injectable({ providedIn: 'root' })
export class TeamService {
  private url = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Team[]> {
    return this.http
      .get<HateoasCollection<Team>>(this.url)
      .pipe(map(res => res._embedded?.['teamList'] ?? []));
  }

  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.url}/${id}`);
  }

  create(team: Team): Observable<Team> {
    return this.http.post<Team>(this.url, team);
  }

  update(id: number, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.url}/${id}`, team);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
