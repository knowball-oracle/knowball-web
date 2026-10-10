import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowDown, LucideAngularModule, Search } from 'lucide-angular';

import { Eye, Plus } from '../../../shared/icons/icons';
import { ReportService } from '../services/report.service';
import { Report } from '../../../models/report.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './report-list.component.html',
})
export class ReportListComponent implements OnInit {
  private readonly service = inject(ReportService);
  private readonly document = inject(DOCUMENT);
  private readonly fb = inject(FormBuilder);

  readonly auth = inject(AuthService);

  items: Report[] = [];
  allItems: Report[] = [];
  loading = true;
  error = '';

  readonly ArrowDownIcon = ArrowDown;
  readonly EyeIcon = Eye;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;

  readonly filters = this.fb.group({
    protocol: [''],
    status: [''],
  });

  ngOnInit(): void {
    this.load();

    this.filters.valueChanges.subscribe(() => this.applyFilters());
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.service.getAll().subscribe({
      next: (data) => {
        this.allItems = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar denúncias.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    const { protocol, status } = this.filters.getRawValue();
    const normalizedProtocol = this.normalize(protocol);

    this.items = this.allItems.filter((item) => {
      const matchesProtocol =
        !normalizedProtocol || this.normalize(item.protocol).includes(normalizedProtocol);

      const matchesStatus = !status || item.status === status;

      return matchesProtocol && matchesStatus;
    });
  }

  onFilterSubmit(): void {
    this.applyFilters();
  }

  scrollToList(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.document.getElementById('denuncias-lista')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      NEW: 'Nova',
      UNDER_REVIEW: 'Em análise',
      RESOLVED: 'Resolvida',
    };

    return labels[status] ?? status;
  }

  statusStyle(status: string): string {
    const styles: Record<string, string> = {
      NEW: 'border border-blue-500/20 bg-blue-500/15 text-blue-300',
      UNDER_REVIEW: 'border border-amber-500/20 bg-amber-500/15 text-amber-300',
      RESOLVED: 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
    };

    return styles[status] ?? 'border border-white/10 bg-white/5 text-white/65';
  }

  resultLabel(result: string): string {
    const labels: Record<string, string> = {
      POSITIVE: 'Positivo',
      NEUTRAL: 'Neutro',
      NEGATIVE: 'Negativo',
    };

    return labels[result] ?? result;
  }

  resultStyle(result: string): string {
    const styles: Record<string, string> = {
      POSITIVE: 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
      NEUTRAL: 'border border-white/10 bg-white/5 text-white/65',
      NEGATIVE: 'border border-red-500/20 bg-red-500/15 text-red-300',
    };

    return styles[result] ?? 'border border-white/10 bg-white/5 text-white/65';
  }

  countByStatus(status: string): number {
    return this.allItems.filter((item) => item.status === status).length;
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
  }
}
