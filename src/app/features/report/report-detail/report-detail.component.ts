import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../services/report.service';
import { Report } from '../../../models/report.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-detail.component.html',
})
export class ReportDetailComponent implements OnInit {
  @Input() id!: string;

  private service = inject(ReportService);

  report: Report | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.service.getById(Number(this.id)).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar denúncia.';
        this.loading = false;
      },
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-blue-500/20 text-blue-400',
      UNDER_REVIEW: 'bg-yellow-500/20 text-yellow-400',
      RESOLVED: 'bg-green-500/20 text-green-400',
    };
    return map[status] ?? 'bg-white/10 text-white/40';
  }

  resultColor(result: string): string {
    const map: Record<string, string> = {
      POSITIVE: 'bg-green-500/20 text-green-400',
      NEUTRAL: 'bg-white/10 text-white/40',
      NEGATIVE: 'bg-red-500/20 text-red-400',
    };
    return map[result] ?? '';
  }
}
