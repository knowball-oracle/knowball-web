import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="min-h-dvh flex items-center justify-center" style="background:#06060f;">
      <p class="text-white/50 text-sm">Finalizando login...</p>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.http
      .get<{
        id: number;
        email: string;
        name: string;
        role: string;
        profilePicture?: string;
      }>(`${environment.apiUrl}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .subscribe({
        next: (userData) => {
          this.auth.saveSession(token, {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            photo: userData.profilePicture ?? undefined,
          });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.router.navigate(['/auth/login']);
        },
      });
  }
}
