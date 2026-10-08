import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowDown, LucideAngularModule, Search, ShieldCheck, UserRound, X } from 'lucide-angular';
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
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    activeChip:
      'border-emerald-500/60 text-emerald-700 dark:border-emerald-400/60 dark:text-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    icon: 'text-emerald-700 dark:text-emerald-400',
  },
  INACTIVE: {
    label: 'Inativos',
    description: 'Sem atuação',
    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    activeChip: 'border-slate-400/60 text-slate-700 dark:border-white/30 dark:text-white/70',
    dot: 'bg-slate-500 dark:bg-slate-400',
    icon: 'text-slate-600 dark:text-slate-300',
  },
  SUSPENDED: {
    label: 'Suspensos',
    description: 'Atenção necessária',
    badge: 'bg-red-500/10 text-red-700 dark:text-red-400',
    activeChip: 'border-red-500/60 text-red-700 dark:border-red-400/60 dark:text-red-400',
    dot: 'bg-red-500 dark:bg-red-400',
    icon: 'text-red-700 dark:text-red-400',
  },
};

const FALLBACK_STATUS: StatusMeta = {
  label: 'Outros',
  description: 'Status não informado',
  badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  activeChip: 'border-slate-400/60 text-slate-700 dark:border-white/30 dark:text-white/70',
  dot: 'bg-slate-400',
  icon: 'text-slate-600 dark:text-slate-300',
};

@Component({
  selector: 'app-referee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './referee-list.component.html',
})
export class RefereeListComponent implements OnInit {
  private service = inject(RefereeService);
  private document = inject(DOCUMENT);
  auth = inject(AuthService);

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
  readonly UserIcon = UserRound;
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
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
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
