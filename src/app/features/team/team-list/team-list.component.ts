import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowDown, Shield, ChevronDown } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { TeamService } from '../services/team.service';
import { Team } from '../../../models/team.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { TeamBadgeComponent } from '../../../shared/components/team-badge/team-badge.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
    TeamBadgeComponent,
  ],
  templateUrl: './team-list.component.html',
})
export class TeamListComponent implements OnInit {
  private service = inject(TeamService);
  private document = inject(DOCUMENT);
  auth = inject(AuthService);

  items: Team[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly ArrowDownIcon = ArrowDown;
  readonly ChevronDownIcon = ChevronDown;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly ShieldIcon = Shield;

  selectedState = '';

  get states(): string[] {
    const set = new Set<string>();

    for (const team of this.items) {
      if (team.state) {
        set.add(team.state.toUpperCase());
      }
    }

    return Array.from(set).sort();
  }

  get filteredItems(): Team[] {
    if (!this.selectedState) {
      return this.items;
    }

    const uf = this.selectedState.toUpperCase();

    return this.items.filter((team) => team.state && team.state.toUpperCase() === uf);
  }

  stateBadgeClass(uf: string | null | undefined): string {
    switch (uf) {
      case 'SP':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'RJ':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'MG':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'RS':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
      case 'PR':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'BA':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'CE':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
      case 'PE':
        return 'bg-lime-500/10 text-lime-700 dark:text-lime-400';
      case 'SC':
        return 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400';
      case 'GO':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'DF':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-400';
      case 'AM':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-400';
      case 'ES':
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400';
      case 'RN':
        return 'bg-pink-500/10 text-pink-700 dark:text-pink-400';
      case 'MT':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-white/50';
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
        this.items = data.map((team) => ({
          ...team,
          state: team.state ? team.state.toUpperCase() : team.state,
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar times.';
        this.loading = false;
      },
    });
  }

  scrollToList(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.document.getElementById('times-lista')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
  }

  delete(): void {
    if (!this.pendingDeleteId) {
      return;
    }

    this.service.delete(this.pendingDeleteId).subscribe({
      next: () => {
        this.pendingDeleteId = null;
        this.load();
      },
      error: () => {
        this.error = 'Erro ao excluir time.';
        this.pendingDeleteId = null;
      },
    });
  }
}
