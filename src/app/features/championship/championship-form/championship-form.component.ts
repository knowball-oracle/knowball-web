import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChampionshipService } from '../services/championship.service';
import { ChampionshipCategoryType } from '../../../models/championship-category.types';

@Component({
  selector: 'app-championship-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './championship-form.component.html',
})
export class ChampionshipFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private service = inject(ChampionshipService);
  private router = inject(Router);

  loading = false;
  saving = false;
  error = '';
  isEdit = false;
  categories = Object.values(ChampionshipCategoryType);

  form = this.fb.group({
    name: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    category: ['', Validators.required],
  });

  get name() {
    return this.form.get('name')!;
  }
  get year() {
    return this.form.get('year')!;
  }
  get category() {
    return this.form.get('category')!;
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
      next: () => this.router.navigate(['/championships']),
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }
}
