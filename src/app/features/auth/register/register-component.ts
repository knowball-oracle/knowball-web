import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LoginResponse } from '../../../models/login-response.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  currentStep = signal<1 | 2 | 3>(1);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get name() {
    return this.form.get('name')!;
  }
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }

  private controlForStep(step: 1 | 2 | 3) {
    switch (step) {
      case 1:
        return this.name;
      case 2:
        return this.email;
      case 3:
        return this.password;
    }
  }

  goToStep(step: 1 | 2 | 3): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    const control = this.controlForStep(this.currentStep());
    control.markAsTouched();

    if (control.invalid) return;

    if (this.currentStep() < 3) {
      this.currentStep.set((this.currentStep() + 1) as 1 | 2 | 3);
    } else {
      this.onSubmit();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set((this.currentStep() - 1) as 1 | 2 | 3);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: (res: LoginResponse) => {
        this.auth.saveSession(res.token, {
          email: res.email,
          name: res.name,
          role: res.role,
          photo: res.profilePicture ?? undefined,
        });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Erro ao cadastrar. E-mail pode já estar em uso.';
        this.loading = false;
        this.currentStep.set(2);
      },
    });
  }
}
