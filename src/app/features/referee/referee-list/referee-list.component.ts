import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { RefereeService } from '../services/referee.service';
import { Referee } from '../../../models/referee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-referee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './referee-list.component.html',
})
export class RefereeListComponent implements OnInit {
  private service = inject(RefereeService);
  auth = inject(AuthService);

  items: Referee[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
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
        this.error = 'Erro ao carregar árbitros.';
        this.loading = false;
      },
    });
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
  }

  delete(): void {
    if (!this.pendingDeleteId) return;
    this.service.delete(this.pendingDeleteId).subscribe({
      next: () => {
        this.pendingDeleteId = null;
        this.load();
      },
    });
  }

  statusStyle(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-400/10 text-emerald-400',
      INACTIVE: 'bg-white/8 text-white/40',
      SUSPENDED: 'bg-red-400/10 text-red-400',
    };
    return map[status] ?? 'bg-white/8 text-white/40';
  }
}
