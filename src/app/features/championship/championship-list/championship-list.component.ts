import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { ChampionshipService } from '../services/championship.service';
import { Championship } from '../../../models/championship.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './championship-list.component.html',
})
export class ChampionshipListComponent implements OnInit {
  private service = inject(ChampionshipService);
  private router = inject(Router);
  auth = inject(AuthService);

  items: Championship[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;

  readonly categories = ['SUB_13', 'SUB_15', 'SUB_17', 'SUB_20'] as const;
  selectedCategory: string | null = null;

  get filteredItems(): Championship[] {
    if (!this.selectedCategory) return this.items;
    return this.items.filter((i) => i.category === this.selectedCategory);
  }

  countByCategory(category: string): number {
    return this.items.filter((i) => i.category === category).length;
  }

  categoryClass(category: string | null | undefined): string {
    switch (category) {
      case 'SUB_13':
        return 'bg-blue-500/10 text-blue-400';
      case 'SUB_15':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'SUB_17':
        return 'bg-amber-500/10 text-amber-400';
      case 'SUB_20':
        return 'bg-rose-500/10 text-rose-400';
      default:
        return 'bg-slate-500/10 text-slate-300';
    }
  }

  categoryBorderClass(category: string): string {
    switch (category) {
      case 'SUB_13':
        return 'border-blue-400/60 text-blue-400';
      case 'SUB_15':
        return 'border-emerald-400/60 text-emerald-400';
      case 'SUB_17':
        return 'border-amber-400/60 text-amber-400';
      case 'SUB_20':
        return 'border-rose-400/60 text-rose-400';
      default:
        return 'border-white/20 text-white/50';
    }
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.service.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar campeonatos.';
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
}
