import { Injectable, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly PHOTO_KEY = 'user_photo';
  private url = `${environment.apiUrl}/auth`;

  private _user = signal<SessionUser | null>(this._loadUser());
  private _photo = signal<string | null>(this._loadPhoto());

  readonly user = this._user.asReadonly();
  readonly photo = this._photo.asReadonly();

  constructor(private http: HttpClient) {}

  private _isValidBase64Image(value: string): boolean {
    const prefixPattern = /^data:image\/(jpeg|png|webp|gif);base64,/;
    if (!prefixPattern.test(value)) return false;
    const payloadStart = value.indexOf(',') + 1;
    const payload = value.slice(payloadStart);
    if (payload.includes('data:')) return false;
    return true;
  }

  private _loadUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  private _loadPhoto(): string | null {
    if (typeof window === 'undefined') return null;
    const email = JSON.parse(localStorage.getItem(this.USER_KEY) ?? 'null')?.email ?? 'anonymous';
    const stored = localStorage.getItem(`${this.PHOTO_KEY}_${email}`);
    if (stored && !this._isValidBase64Image(stored)) {
      localStorage.removeItem(`${this.PHOTO_KEY}_${email}`);
      return null;
    }
    return stored;
  }

  private photoKey(): string {
    const email = this._user()?.email ?? 'anonymous';
    return `${this.PHOTO_KEY}_${email}`;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, request).pipe(
      tap((res) =>
        this.saveSession(res.token, {
          email: res.email,
          name: res.name,
          role: res.role,
          photo: res.profilePicture ?? undefined,
        }),
      ),
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/register`, request);
  }

  saveSession(token: string, user: SessionUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);

    if (user.photo) {
      if (this._isValidBase64Image(user.photo)) {
        localStorage.setItem(`${this.PHOTO_KEY}_${user.email}`, user.photo);
        this._photo.set(user.photo);
      } else {
        const savedPhoto = localStorage.getItem(`${this.PHOTO_KEY}_${user.email}`) ?? null;
        this._photo.set(savedPhoto);
      }
    } else {
      const savedPhoto = localStorage.getItem(`${this.PHOTO_KEY}_${user.email}`) ?? null;
      this._photo.set(savedPhoto);
    }
  }

  savePhoto(base64: string): void {
    if (!this._isValidBase64Image(base64)) {
      console.warn('[AuthService] savePhoto: Base64 inválido, ignorado.');
      return;
    }
    localStorage.setItem(this.photoKey(), base64);
    this._photo.set(base64);
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
    this._user.set(null);
    this._photo.set(null);
  }
}
