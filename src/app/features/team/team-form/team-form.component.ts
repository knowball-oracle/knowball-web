import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './team-form.component.html',
})
export class TeamFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private service = inject(TeamService);
  private router = inject(Router);

  loading = false;
  saving = false;
  error = '';
  isEdit = false;

  form = this.fb.group({
    name: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', [Validators.required, Validators.maxLength(2)]],
  });

  get name() {
    return this.form.get('name')!;
  }
  get city() {
    return this.form.get('city')!;
  }
  get state() {
    return this.form.get('state')!;
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
      next: () => this.router.navigate(['/teams']),
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }
}
