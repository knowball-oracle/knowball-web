import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Participation } from '../../../models/participation.model';
import { ParticipationType } from '../../../models/participation.types';
import { HateoasCollection } from '../../../shared/types/hateoas.types';

interface ParticipationRequest {
  game: { id: number };
  team: { id: number };
  type: ParticipationType;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  private url = `${environment.apiUrl}/participations`;

  constructor(private http: HttpClient) {}

  getByGame(gameId: number): Observable<Participation[]> {
    return this.http
      .get<HateoasCollection<Participation>>(`${this.url}/game/${gameId}`)
      .pipe(map((res) => res._embedded?.['participationList'] ?? []));
  }

  getById(gameId: number, teamId: number): Observable<Participation> {
    return this.http.get<Participation>(`${this.url}/game/${gameId}/team/${teamId}`);
  }

  create(participation: ParticipationRequest): Observable<Participation> {
    return this.http.post<Participation>(this.url, participation);
  }

  update(participation: ParticipationRequest): Observable<Participation> {
    return this.http.put<Participation>(this.url, participation);
  }

  delete(gameId: number, teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/game/${gameId}/team/${teamId}`);
  }
}
