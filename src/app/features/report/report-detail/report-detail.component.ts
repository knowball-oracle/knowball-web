import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { ReportService } from '../services/report.service';
import { Report } from '../../../models/report.model';
import { AuthService } from '../../../core/services/auth.service';
import { AnalysisResultType, ReportStatusType } from '../../../models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './report-detail.component.html',
})
export class ReportDetailComponent implements OnInit {
  @Input() id!: string;

  private service = inject(ReportService);
  private router = inject(Router);
  auth = inject(AuthService);

  readonly TrashIcon = Trash2;

  report: Report | null = null;
  loading = true;
  error = '';
  updateError = '';
  updateSuccess = false;
  deleteError = '';
  deleting = false;
  showDeleteConfirm = false;

  selectedStatus = '';
  selectedResult = '';

  currentUserId = signal<number | null>(null);

  ngOnInit(): void {
    this.currentUserId.set(this.auth.getUser()?.id ?? null);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getById(Number(this.id)).subscribe({
      next: (data) => {
        this.report = data;
        this.selectedStatus = data.status;
        this.selectedResult = data.analysisResult ?? '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar denúncia.';
        this.loading = false;
      },
    });
  }

  updateStatus(): void {
    this.updateError = '';
    this.updateSuccess = false;

    this.service
      .updateStatus(Number(this.id), {
        status: this.selectedStatus as ReportStatusType,
        analysisResult: (this.selectedResult as AnalysisResultType) || null,
      })
      .subscribe({
        next: () => {
          this.updateSuccess = true;
          this.load();
          setTimeout(() => (this.updateSuccess = false), 3000);
        },
        error: () => {
          this.updateError = 'Erro ao atualizar status.';
        },
      });
  }

  canDelete(): boolean {
    if (this.auth.isAdmin()) return true;
    if (!this.report?.user?.id || !this.currentUserId()) return false;
    return this.report.user.id === this.currentUserId();
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  deleteReport(): void {
    const reportId = this.report?.id ?? Number(this.id);
    if (!reportId || this.deleting) return;

    this.deleting = true;
    this.deleteError = '';
    this.showDeleteConfirm = false;

    this.service.delete(reportId).subscribe({
      next: () => {
        this.router.navigate(['/reports']);
      },
      error: (err) => {
        this.deleting = false;

        if (err.status === 403) {
          this.deleteError = 'Você não tem permissão para excluir esta denúncia.';
          return;
        }
        if (err.status === 404) {
          this.deleteError = 'Denúncia não encontrada.';
          return;
        }

        this.deleteError = 'Erro ao excluir denúncia.';
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
