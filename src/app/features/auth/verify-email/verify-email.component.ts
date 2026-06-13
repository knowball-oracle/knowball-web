import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../models/login-response.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: 'verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  loading = signal(false);
  error = signal('');
  resendOk = signal(false);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  get code() {
    return this.form.get('code')!;
  }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!email) {
      this.router.navigate(['/auth/register']);
      return;
    }
    this.email.set(email);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/verify-email`, {
        email: this.email(),
        code: this.code.value,
      })
      .subscribe({
        next: (res) => {
          this.auth.saveSession(res.token, {
            email: res.email,
            name: res.name,
            role: res.role,
            photo: res.profilePicture ?? undefined,
          });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error.set('Código inválido ou expirado. Tente novamente.');
          this.loading.set(false);
        },
      });
  }

  resendCode(): void {
    this.resendOk.set(false);
    this.error.set('');

    this.http.post(`${environment.apiUrl}/auth/resend-code`, { email: this.email() }).subscribe({
      next: () => this.resendOk.set(true),
      error: () => this.error.set('Erro ao reenviar o código. Tente novamente.'),
    });
  }
}
