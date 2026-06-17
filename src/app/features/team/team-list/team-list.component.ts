import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { TeamService } from '../services/team.service';
import { Team } from '../../../models/team.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './team-list.component.html',
})
export class TeamListComponent implements OnInit {
  private service = inject(TeamService);
  auth = inject(AuthService);

  items: Team[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;

  selectedState: string = '';

  get states(): string[] {
    const set = new Set<string>();
    for (const t of this.items) {
      if (t.state) set.add(t.state.toUpperCase());
    }
    return Array.from(set).sort();
  }

  get filteredItems(): Team[] {
    if (!this.selectedState) return this.items;
    const uf = this.selectedState.toUpperCase();
    return this.items.filter((t) => t.state && t.state.toUpperCase() === uf);
  }

  stateBadgeClass(uf: string | null | undefined): string {
    switch (uf) {
      case 'SP':
        return 'bg-blue-500/10 text-blue-400';
      case 'RJ':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'MG':
        return 'bg-amber-500/10 text-amber-400';
      case 'RS':
        return 'bg-rose-500/10 text-rose-400';
      case 'PR':
        return 'bg-purple-500/10 text-purple-400';
      case 'BA':
        return 'bg-red-500/10 text-red-400';
      case 'CE':
        return 'bg-cyan-500/10 text-cyan-400';
      case 'PE':
        return 'bg-lime-500/10 text-lime-400';
      case 'SC':
        return 'bg-fuchsia-500/10 text-fuchsia-400';
      case 'GO':
        return 'bg-orange-500/10 text-orange-400';
      case 'DF':
        return 'bg-sky-500/10 text-sky-400';
      case 'AM':
        return 'bg-teal-500/10 text-teal-400';
      case 'ES':
        return 'bg-indigo-500/10 text-indigo-400';
      case 'RN':
        return 'bg-pink-500/10 text-pink-400';
      case 'MT':
        return 'bg-yellow-500/10 text-yellow-400';
      default:
        return 'bg-white/8 text-white/50';
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
        this.items = data.map((t) => ({
          ...t,
          state: t.state ? t.state.toUpperCase() : t.state,
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar times.';
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
