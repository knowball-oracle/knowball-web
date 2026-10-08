import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowDown, Search } from 'lucide-angular';
import { Eye, Plus } from '../../../shared/icons/icons';
import { ReportService } from '../services/report.service';
import { Report } from '../../../models/report.model';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './report-list.component.html',
})
export class ReportListComponent implements OnInit {
  private service = inject(ReportService);
  private document = inject(DOCUMENT);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  items: Report[] = [];
  allItems: Report[] = [];
  loading = true;
  error = '';

  readonly ArrowDownIcon = ArrowDown;
  readonly EyeIcon = Eye;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;

  filters = this.fb.group({
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

    this.items = this.allItems.filter((item) => {
      const matchProtocol =
        !protocol ||
        (item.protocol && item.protocol.toLowerCase().includes(protocol.toLowerCase()));

      const matchStatus = !status || item.status === status;

      return matchProtocol && matchStatus;
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
    const map: Record<string, string> = {
      NEW: 'Nova',
      UNDER_REVIEW: 'Em análise',
      RESOLVED: 'Resolvida',
    };

    return map[status] ?? status;
  }

  statusStyle(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      UNDER_REVIEW: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      RESOLVED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };

    return map[status] ?? 'bg-slate-500/10 text-slate-600 dark:text-white/40';
  }

  resultLabel(result: string): string {
    const map: Record<string, string> = {
      POSITIVE: 'Positivo',
      NEUTRAL: 'Neutro',
      NEGATIVE: 'Negativo',
    };

    return map[result] ?? result;
  }

  resultStyle(result: string): string {
    const map: Record<string, string> = {
      POSITIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      NEUTRAL: 'bg-slate-500/10 text-slate-600 dark:text-white/40',
      NEGATIVE: 'bg-red-500/10 text-red-700 dark:text-red-400',
    };

    return map[result] ?? '';
  }

  countByStatus(status: string): number {
    return this.allItems.filter((item) => item.status === status).length;
  }
}
