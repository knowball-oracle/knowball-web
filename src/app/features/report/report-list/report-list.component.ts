import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Eye, Plus } from '../../../shared/icons/icons';
import { ReportService } from '../services/report.service';
import { Report } from '../../../models/report.model';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './report-list.component.html',
})
export class ReportListComponent implements OnInit {
  private service = inject(ReportService);
  private router = inject(Router);

  items: Report[] = [];
  loading = true;
  error = '';

  readonly EyeIcon = Eye;
  readonly PlusIcon = Plus;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar denúncias.';
        this.loading = false;
      },
    });
  }

  statusStyle(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-blue-400/10 text-blue-400',
      UNDER_REVIEW: 'bg-amber-400/10 text-amber-400',
      RESOLVED: 'bg-emerald-400/10 text-emerald-400',
    };
    return map[status] ?? 'bg-white/8 text-white/40';
  }

  resultStyle(result: string): string {
    const map: Record<string, string> = {
      POSITIVE: 'bg-emerald-400/10 text-emerald-400',
      NEUTRAL: 'bg-white/8 text-white/40',
      NEGATIVE: 'bg-red-400/10 text-red-400',
    };
    return map[result] ?? '';
  }
}
