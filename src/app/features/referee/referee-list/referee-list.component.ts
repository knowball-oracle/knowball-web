import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowDown, LucideAngularModule, Search, ShieldCheck, X } from 'lucide-angular';

import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { RefereeService } from '../services/referee.service';
import { Referee } from '../../../models/referee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

interface StatusMeta {
  label: string;
  description: string;
  badge: string;
  activeChip: string;
  dot: string;
  icon: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  ACTIVE: {
    label: 'Ativos',
    description: 'Em atividade',
    badge: 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
    activeChip: 'border-emerald-400/60 text-emerald-300',
    dot: 'bg-emerald-400',
    icon: 'text-emerald-300',
  },
  INACTIVE: {
    label: 'Inativos',
    description: 'Sem atuação',
    badge: 'border border-white/10 bg-white/5 text-white/60',
    activeChip: 'border-white/30 text-white/70',
    dot: 'bg-white/40',
    icon: 'text-white/60',
  },
  SUSPENDED: {
    label: 'Suspensos',
    description: 'Atenção necessária',
    badge: 'border border-red-500/20 bg-red-500/15 text-red-300',
    activeChip: 'border-red-400/60 text-red-300',
    dot: 'bg-red-400',
    icon: 'text-red-300',
  },
};

const FALLBACK_STATUS: StatusMeta = {
  label: 'Outros',
  description: 'Status não informado',
  badge: 'border border-white/10 bg-white/5 text-white/65',
  activeChip: 'border-white/30 text-white/70',
  dot: 'bg-white/40',
  icon: 'text-white/60',
};

@Component({
  selector: 'app-referee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './referee-list.component.html',
})
export class RefereeListComponent implements OnInit {
  private readonly service = inject(RefereeService);
  private readonly document = inject(DOCUMENT);

  readonly auth = inject(AuthService);

  items: Referee[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  search = '';
  selectedStatus: string | null = null;

  readonly ArrowDownIcon = ArrowDown;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly ShieldIcon = ShieldCheck;
  readonly XIcon = X;

  readonly statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;

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
        this.error = 'Erro ao carregar árbitros.';
        this.loading = false;
      },
    });
  }

  scrollToList(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.document
      .getElementById('arbitros-lista')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  meta(status: string | null | undefined): StatusMeta {
    return (status && STATUS_META[status]) || FALLBACK_STATUS;
  }

  countByStatus(status: string): number {
    return this.items.filter((item) => item.status === status).length;
  }

  toggleStatus(status: string): void {
    this.selectedStatus = this.selectedStatus === status ? null : status;
  }

  get hasActiveFilters(): boolean {
    return this.selectedStatus !== null || this.search.trim() !== '';
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.search = '';
  }

  get filteredItems(): Referee[] {
    const term = this.normalize(this.search);

    return this.items
      .filter((item) => {
        const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
        const matchesSearch = !term || this.normalize(item.name).includes(term);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length > 2)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  age(birthDate: string | Date | null | undefined): number | null {
    if (!birthDate) {
      return null;
    }

    const birth = new Date(birthDate);

    if (Number.isNaN(birth.getTime())) {
      return null;
    }

    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }

    return calculatedAge;
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
        this.error = 'Erro ao excluir árbitro.';
        this.pendingDeleteId = null;
      },
    });
  }

  statusStyle(status: string): string {
    return this.meta(status).badge;
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
  }
}
