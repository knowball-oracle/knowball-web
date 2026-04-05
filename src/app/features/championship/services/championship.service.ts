import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { HateoasCollection, HateoasEntity } from '../../../shared/types/hateoas.types';
import { Championship } from '../../../models/championship.model';

@Injectable({ providedIn: 'root' })
export class ChampionshipService {
  private url = `${environment.apiUrl}/championships`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Championship[]> {
    return this.http
      .get<HateoasCollection<Championship>>(this.url)
      .pipe(map(res => res._embedded?.['championshipList'] ?? []));
  }

  getById(id: number): Observable<Championship> {
    return this.http.get<HateoasEntity<Championship>>(`${this.url}/${id}`);
  }

  create(championship: Championship): Observable<Championship> {
    return this.http.post<Championship>(this.url, championship);
  }

  update(id: number, championship: Championship): Observable<Championship> {
    return this.http.put<Championship>(`${this.url}/${id}`, championship);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
