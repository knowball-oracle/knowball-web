import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserRole } from '../../../models/user-role.types';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  saving = false;
  error = '';
  isEdit = false;

  readonly roles = Object.values(UserRole);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/\S/)]],
    role: this.fb.nonNullable.control<UserRole>(UserRole.ROLE_USER, {
      validators: [Validators.required],
    }),
  });

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get role() {
    return this.form.controls.role;
  }

  ngOnInit(): void {
    if (!this.id) {
      return;
    }

    this.isEdit = true;

    const userId = this.getUserId();

    if (userId === null) {
      this.error = 'O identificador do usuário é inválido.';
      this.form.disable();
      return;
    }

    /*
     * Na edição, senha vazia mantém a senha atual.
     * Quando preenchida, continua sendo validada.
     */
    this.password.setValidators([Validators.minLength(6), Validators.pattern(/\S/)]);

    this.password.updateValueAndValidity({
      emitEvent: false,
    });

    this.loadUser(userId);
  }

  onSubmit(): void {
    if (this.loading || this.saving || this.form.disabled) {
      return;
    }

    this.error = '';

    /*
     * Normaliza somente nome e e-mail.
     * A senha nunca deve ser alterada com trim().
     */
    this.name.setValue(this.name.value.trim());
    this.email.setValue(this.email.value.trim());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revise os campos obrigatórios e os dados informados.';
      return;
    }

    const userId = this.isEdit ? this.getUserId() : null;

    if (this.isEdit && userId === null) {
      this.error = 'O identificador do usuário é inválido.';
      return;
    }

    const values = this.form.getRawValue();
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      ...(values.password !== '' ? { password: values.password } : {}),
    };

    this.saving = true;

    const request$ = this.isEdit
      ? this.service.update(userId!, payload)
      : this.service.create(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        void this.router.navigate(['/users']);
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.error = this.getSaveErrorMessage(error);
      },
    });
  }

  private loadUser(userId: number): void {
    this.loading = true;
    this.error = '';

    this.service
      .getById(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.form.patchValue({
            name: user.name ?? '',
            email: user.email ?? '',
            role: user.role,
            password: '',
          });

          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.form.disable();

          switch (error.status) {
            case 0:
              this.error = 'Não foi possível conectar à API para carregar o usuário.';
              break;

            case 401:
              this.error = 'Sua sessão expirou. Entre novamente para continuar.';
              break;

            case 403:
              this.error = 'Você não tem permissão para consultar este usuário.';
              break;

            case 404:
              this.error = 'O usuário não foi encontrado.';
              break;

            default:
              this.error =
                'Não foi possível carregar os dados do usuário. Recarregue a página e tente novamente.';
          }
        },
      });
  }

  private getUserId(): number | null {
    const value = Number(this.id);

    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }

  private getSaveErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';

      case 400:
        return 'Os dados enviados são inválidos. Confira nome, e-mail, perfil e a nova senha, caso tenha preenchido.';

      case 401:
        return 'Sua sessão expirou. Entre novamente para continuar.';

      case 403:
        return 'Você não tem permissão para alterar ou cadastrar usuários.';

      case 404:
        return 'O usuário não foi encontrado. Atualize a listagem e tente novamente.';

      case 409:
        return 'Não foi possível salvar por um conflito de dados. Verifique se o e-mail já pertence a outro usuário.';

      default:
        return 'Não foi possível salvar o usuário. Tente novamente.';
    }
  }
}
