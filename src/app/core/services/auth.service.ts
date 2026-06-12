import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../../models/login-request.model';
import { LoginResponse } from '../../models/login-response.model';
import { RegisterRequest } from '../../models/register-request.model';

export interface SessionUser {
  email: string;
  name: string;
  role: string;
  photo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly PHOTO_KEY = 'user_photo';
  private url = `${environment.apiUrl}/auth`;

  private _user = signal<SessionUser | null>(this._loadUser());

  readonly user = this._user.asReadonly();
  readonly photo = computed(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.PHOTO_KEY) ?? null;
    }
    return null;
  });

  constructor(private http: HttpClient) {}

  private _loadUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, request)
      .pipe(
        tap((res) =>
          this.saveSession(res.token, { email: res.email, name: res.name, role: res.role }),
        ),
      );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.url}/register`, request)
      .pipe(
        tap((res) =>
          this.saveSession(res.token, { email: res.email, name: res.name, role: res.role }),
        ),
      );
  }

  saveSession(token: string, user: SessionUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  savePhoto(base64: string): void {
    localStorage.setItem(this.PHOTO_KEY, base64);

    const current = this._user();
    if (current) this._user.set({ ...current });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): SessionUser | null {
    return this._user();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const role = this._user()?.role;
    if (!role) return false;
    if (Array.isArray(role)) return role.includes('ROLE_ADMIN');
    return role === 'ROLE_ADMIN';
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.PHOTO_KEY);
    this._user.set(null);
  }
}
