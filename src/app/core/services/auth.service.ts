import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../models/login-request.model';
import { LoginResponse } from '../../models/login-response.model';
import { RegisterRequest } from '../../models/register-request.model';

export interface SessionUser {
  id?: number;
  email: string;
  name: string;
  role: string | string[];
  photo?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly PHOTO_KEY = 'user_photo';

  private readonly url = `${environment.apiUrl}/auth`;

  private readonly _user = signal<SessionUser | null>(this.loadUser());
  private readonly _photo = signal<string | null>(this.loadPhoto());

  readonly user = this._user.asReadonly();
  readonly photo = this._photo.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, request).pipe(
      tap((response) => {
        this.saveSession(response.token, {
          id: response.id,
          email: response.email,
          name: response.name,
          role: response.role,
          photo: response.profilePicture ?? undefined,
        });
      }),
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/register`, request);
  }

  saveSession(token: string, user: SessionUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this._user.set(user);

    const photoKey = `${this.PHOTO_KEY}_${user.email}`;

    if (user.photo && this.isValidBase64Image(user.photo)) {
      localStorage.setItem(photoKey, user.photo);
      this._photo.set(user.photo);
      return;
    }

    const savedPhoto = localStorage.getItem(photoKey);
    this._photo.set(savedPhoto);
  }

  savePhoto(base64: string): void {
    if (!this.isValidBase64Image(base64)) {
      console.warn('[AuthService] Foto em Base64 inválida. Alteração ignorada.');
      return;
    }

    localStorage.setItem(this.photoKey(), base64);
    this._photo.set(base64);
  }

  clearPhoto(): void {
    const user = this._user();

    if (!user) {
      return;
    }

    localStorage.removeItem(`${this.PHOTO_KEY}_${user.email}`);

    const updatedUser: SessionUser = {
      ...user,
      photo: undefined,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this._user.set(updatedUser);
    this._photo.set(null);
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

    if (!role) {
      return false;
    }

    const roles = Array.isArray(role) ? role : [role];

    return roles.some((currentRole) => {
      const normalizedRole = String(currentRole).trim().toUpperCase();

      return normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this._user.set(null);
    this._photo.set(null);
  }

  redirectToGoogleLogin(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  sendVerificationCode(email: string): Observable<void> {
    return this.http.post<void>(`${this.url}/verification/send`, { email });
  }

  confirmVerificationCode(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${this.url}/verification/confirm`, {
      email,
      code,
    });
  }

  private loadUser(): SessionUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedUser = localStorage.getItem(this.USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as SessionUser;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private loadPhoto(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const user = this.loadUser();
    const email = user?.email ?? 'anonymous';
    const storedPhoto = localStorage.getItem(`${this.PHOTO_KEY}_${email}`);

    if (storedPhoto && !this.isValidBase64Image(storedPhoto)) {
      localStorage.removeItem(`${this.PHOTO_KEY}_${email}`);
      return null;
    }

    return storedPhoto;
  }

  private photoKey(): string {
    const email = this._user()?.email ?? 'anonymous';

    return `${this.PHOTO_KEY}_${email}`;
  }

  private isValidBase64Image(value: string): boolean {
    const imagePrefix = /^data:image\/(jpeg|png|webp|gif);base64,/;

    if (!imagePrefix.test(value)) {
      return false;
    }

    const payload = value.slice(value.indexOf(',') + 1);

    return !payload.includes('data:');
  }
}
