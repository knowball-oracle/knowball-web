import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RefereeService } from '../services/referee.service';
import { RefereeStatusType } from '../../../models/referee-status.types';

@Component({
  selector: 'app-referee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './referee-form.component.html',
})
export class RefereeFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private service = inject(RefereeService);
  private router = inject(Router);

  loading = false;
  saving = false;
  error = '';
  isEdit = false;
  statuses = Object.values(RefereeStatusType);

  form = this.fb.group({
    name: ['', Validators.required],
    birthDate: ['', Validators.required],
    status: ['', Validators.required],
  });

  get name() {
    return this.form.get('name')!;
  }
  get birthDate() {
    return this.form.get('birthDate')!;
  }
  get status() {
    return this.form.get('status')!;
  }

  ngOnInit(): void {
    if (this.id) {
      this.isEdit = true;
      this.loading = true;
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
    const req$ = this.isEdit
      ? this.service.update(Number(this.id), payload)
      : this.service.create(payload);
    req$.subscribe({
      next: () => this.router.navigate(['/referees']),
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }
}
