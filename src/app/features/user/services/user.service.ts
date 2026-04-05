import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserResponse } from "../../../models/user-response.model";
import { User } from "../../../models/user.model";

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { name?: string; email?: string }, page = 0, size = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filters?.name)  params = params.set('name', filters.name);
    if (filters?.email) params = params.set('email', filters.email);

    return this.http.get(this.url, { params });
  }

  getById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.url}/${id}`);
  }

  create(user: User): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.url, user);
  }

  update(id: number, user: User): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.url}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
