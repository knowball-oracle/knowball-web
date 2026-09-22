import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LoginResponse } from '../../../models/login-response.model';

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    const confirmControl = group.get('confirmPassword');

    if (!confirmControl) return null;

    if (password !== confirmPassword) {
      confirmControl.setErrors({ ...confirmControl.errors, mismatch: true });
    } else if (confirmControl.hasError('mismatch')) {
      const { mismatch, ...rest } = confirmControl.errors ?? {};
      confirmControl.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}

type Step = 1 | 2 | 3 | 4;

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
  sendingCode = false;
  error = '';
  codeError = '';

  currentStep = signal<Step>(1);

  resendCooldown = signal(0);
  private cooldownTimer?: ReturnType<typeof setInterval>;

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    },
    { validators: passwordsMatchValidator() },
  );

  get name() {
    return this.form.get('name')!;
  }
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }
  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }
  get code() {
    return this.form.get('code')!;
  }

  private controlForStep(step: number) {
    switch (step) {
      case 1:
        return this.name;
      case 2:
        return this.email;
      case 3:
        return this.confirmPassword;
      default:
        return this.code;
    }
  }

  goToStep(step: number): void {
    if (step < 1 || step > 4) return;
    if (step < this.currentStep()) {
      this.currentStep.set(step as Step);
    }
  }

  nextStep(): void {
    const step = this.currentStep();

    if (step === 4) {
      this.confirmCode();
      return;
    }

    if (step === 3) {
      this.password.markAsTouched();
      this.confirmPassword.markAsTouched();
      if (this.password.invalid || this.confirmPassword.invalid) return;
    } else {
      const control = this.controlForStep(step);
      control.markAsTouched();
      if (control.invalid) return;
    }

    const nextStepValue = (step + 1) as Step;
    this.currentStep.set(nextStepValue);

    if (nextStepValue === 4) {
      this.sendVerificationCode();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.stopCooldown();
      this.currentStep.set((this.currentStep() - 1) as Step);
    }
  }

  sendVerificationCode(): void {
    this.sendingCode = true;
    this.codeError = '';
    this.code.reset();

    this.auth.sendVerificationCode(this.email.value!).subscribe({
      next: () => {
        this.sendingCode = false;
        this.startCooldown(60);
      },
      error: () => {
        this.sendingCode = false;
        this.codeError = 'Não foi possível enviar o código. Tente reenviar.';
      },
    });
  }

  resendCode(): void {
    if (this.resendCooldown() > 0) return;
    this.sendVerificationCode();
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    this.cooldownTimer = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.stopCooldown();
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  private stopCooldown(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.resendCooldown.set(0);
  }

  confirmCode(): void {
    this.code.markAsTouched();
    if (this.code.invalid) return;

    this.loading = true;
    this.codeError = '';

    this.auth.confirmVerificationCode(this.email.value!, this.code.value!).subscribe({
      next: () => this.onSubmit(),
      error: () => {
        this.loading = false;
        this.codeError = 'Código inválido ou expirado. Tente novamente ou reenvie.';
      },
    });
  }

  private onSubmit(): void {
    const { name, email, password } = this.form.getRawValue();

    this.auth.register({ name, email, password } as any).subscribe({
      next: (res: LoginResponse) => {
        this.auth.saveSession(res.token, {
          email: res.email,
          name: res.name,
          role: res.role,
          photo: res.profilePicture ?? undefined,
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;

        const backendMessage: string = typeof err?.error === 'string' ? err.error : '';

        if (backendMessage.toLowerCase().includes('verifica')) {
          this.codeError = backendMessage || 'Verificação expirada. Solicite um novo código.';
          this.currentStep.set(4);
          this.sendVerificationCode();
          return;
        }

        this.error = backendMessage || 'Erro ao cadastrar. E-mail pode já estar em uso.';
        this.currentStep.set(2);
      },
    });
  }
}
