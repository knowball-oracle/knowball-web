import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Refereeing } from '../../../models/refereeing.model';
import { RefereeingRoleType } from '../../../models/refereeing-role.types';
import { HateoasCollection } from '../../../shared/types/hateoas.types';

interface RefereeingRequest {
  game: { id: number };
  referee: { id: number };
  role: RefereeingRoleType;
}

@Injectable({
  providedIn: 'root'
})
export class RefereeingService {
  private url = `${environment.apiUrl}/refereeing`;

  constructor(private http: HttpClient) {}

  getByGame(gameId: number): Observable<Refereeing[]> {
    return this.http
      .get<HateoasCollection<Refereeing>>(`${this.url}/game/${gameId}`)
      .pipe(map((res) => res._embedded?.['refereeingList'] ?? []));
  }

  getById(gameId: number, refereeId: number): Observable<Refereeing> {
    return this.http.get<Refereeing>(`${this.url}/game/${gameId}/referee/${refereeId}`);
  }

  create(refereeing: RefereeingRequest): Observable<Refereeing> {
    return this.http.post<Refereeing>(this.url, refereeing);
  }
}
