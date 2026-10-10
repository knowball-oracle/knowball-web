import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowDown,
  ChevronDown,
  LucideAngularModule,
  Shield,
} from 'lucide-angular';

import { Pencil, Plus, Trash2 } from '../../../shared/icons/icons';
import { TeamService } from '../services/team.service';
import { Team } from '../../../models/team.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly service = inject(TeamService);
  private readonly document = inject(DOCUMENT);

  readonly auth = inject(AuthService);

  items: Team[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  selectedState = '';

  readonly ArrowDownIcon = ArrowDown;
  readonly ChevronDownIcon = ChevronDown;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly ShieldIcon = Shield;

  get states(): string[] {
    const states = new Set<string>();

    for (const team of this.items) {
      if (team.state) {
        states.add(team.state.toUpperCase());
      }
    }

    return Array.from(states).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  get filteredItems(): Team[] {
    if (!this.selectedState) {
      return this.items;
    }

    const uf = this.selectedState.toUpperCase();

    return this.items.filter(
      (team) => team.state && team.state.toUpperCase() === uf,
    );
  }

  stateBadgeClass(uf: string | null | undefined): string {
    switch (uf?.toUpperCase()) {
      case 'SP':
        return 'border border-blue-500/20 bg-blue-500/15 text-blue-300';

      case 'RJ':
        return 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300';

      case 'MG':
        return 'border border-amber-500/20 bg-amber-500/15 text-amber-300';

      case 'RS':
        return 'border border-rose-500/20 bg-rose-500/15 text-rose-300';

      case 'PR':
        return 'border border-purple-500/20 bg-purple-500/15 text-purple-300';

      case 'BA':
        return 'border border-red-500/20 bg-red-500/15 text-red-300';

      case 'CE':
        return 'border border-cyan-500/20 bg-cyan-500/15 text-cyan-300';

      case 'PE':
        return 'border border-lime-500/20 bg-lime-500/15 text-lime-300';

      case 'SC':
        return 'border border-fuchsia-500/20 bg-fuchsia-500/15 text-fuchsia-300';

      case 'GO':
        return 'border border-orange-500/20 bg-orange-500/15 text-orange-300';

      case 'DF':
        return 'border border-sky-500/20 bg-sky-500/15 text-sky-300';

      case 'AM':
        return 'border border-teal-500/20 bg-teal-500/15 text-teal-300';

      case 'ES':
        return 'border border-indigo-500/20 bg-indigo-500/15 text-indigo-300';

      case 'RN':
        return 'border border-pink-500/20 bg-pink-500/15 text-pink-300';

      case 'MT':
        return 'border border-yellow-500/20 bg-yellow-500/15 text-yellow-300';

      default:
        return 'border border-white/10 bg-white/5 text-white/65';
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
