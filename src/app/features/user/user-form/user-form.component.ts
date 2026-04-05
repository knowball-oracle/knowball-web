import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { UserRole } from '../../../models/user-role.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private service = inject(UserService);
  private router = inject(Router);

  loading = false;
  saving = false;
  error = '';
  isEdit = false;
  roles = Object.values(UserRole);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['ROLE_USER', Validators.required],
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
  get role() {
    return this.form.get('role')!;
  }

  ngOnInit(): void {
    if (this.id) {
      this.isEdit = true;
      this.loading = true;
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.updateValueAndValidity();
      this.service.getById(Number(this.id)).subscribe({
        next: (data) => {
          this.form.patchValue(data);
          this.loading = false;
        },
        error: () => {
          this.error = 'Erro ao carregar dados.';
          this.loading = false;
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.getRawValue() as any;
    if (this.isEdit && !payload.password) delete payload.password;
    const req$ = this.isEdit
      ? this.service.update(Number(this.id), payload)
      : this.service.create(payload);
    req$.subscribe({
      next: () => this.router.navigate(['/users']),
      error: () => {
        this.error = 'Erro ao salvar. E-mail pode já estar em uso.';
        this.saving = false;
      },
    });
  }
}
