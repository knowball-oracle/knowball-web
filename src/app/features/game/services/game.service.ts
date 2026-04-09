import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Game } from '../../../models/game.model';
import { HateoasCollection } from '../../../shared/types/hateoas.types';

interface GameRequest {
  championship: { id: number };
  matchDate: string;
  place: string;
  homeScore: number;
  awayScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private url = `${environment.apiUrl}/games`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Game[]> {
    return this.http
      .get<HateoasCollection<Game>>(this.url)
      .pipe(map((res) => res._embedded?.['gameList'] ?? []));
  }

  getById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.url}/${id}`);
  }

  getByChampionship(championshipId: number): Observable<Game[]> {
    return this.http
      .get<HateoasCollection<Game>>(`${this.url}/championship/${championshipId}`)
      .pipe(map((res) => res._embedded?.['gameList'] ?? []));
  }

  create(game: GameRequest): Observable<Game> {
    return this.http.post<Game>(this.url, game);
  }

  update(id: number, game: GameRequest): Observable<Game> {
    return this.http.put<Game>(`${this.url}/${id}`, game);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
