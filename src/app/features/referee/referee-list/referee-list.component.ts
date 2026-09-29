import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, ShieldCheck, UserRound, X } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { RefereeService } from '../services/referee.service';
import { Referee } from '../../../models/referee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

interface StatusMeta {
  label: string;
  description: string;
  gradient: string;
  badge: string;
  activeChip: string;
  ring: string;
  dot: string;
  icon: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  ACTIVE: {
    label: 'Ativos',
    description: 'Em atividade',
    gradient: 'bg-linear-to-br from-emerald-500 to-teal-800',
    badge: 'bg-emerald-500/10 text-emerald-400',
    activeChip: 'border-emerald-400/60 text-emerald-400',
    ring: 'ring-emerald-400/80',
    dot: 'bg-emerald-400',
    icon: 'text-emerald-400',
  },
  INACTIVE: {
    label: 'Inativos',
    description: 'Sem atuação',
    gradient: 'bg-linear-to-br from-slate-500 to-slate-800',
    badge: 'bg-white/8 text-white/50',
    activeChip: 'border-white/30 text-white/70',
    ring: 'ring-slate-400/80',
    dot: 'bg-slate-400',
    icon: 'text-slate-300',
  },
  SUSPENDED: {
    label: 'Suspensos',
    description: 'Atenção necessária',
    gradient: 'bg-linear-to-br from-rose-500 to-red-900',
    badge: 'bg-red-500/10 text-red-400',
    activeChip: 'border-red-400/60 text-red-400',
    ring: 'ring-red-400/80',
    dot: 'bg-red-400',
    icon: 'text-red-400',
  },
};

const FALLBACK_STATUS: StatusMeta = {
  label: 'Outros',
  description: 'Status não informado',
  gradient: 'bg-linear-to-br from-slate-500 to-slate-800',
  badge: 'bg-white/8 text-white/50',
  activeChip: 'border-white/30 text-white/70',
  ring: 'ring-slate-400/80',
  dot: 'bg-slate-400',
  icon: 'text-slate-300',
};

@Component({
  selector: 'app-referee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './referee-list.component.html',
})
export class RefereeListComponent implements OnInit {
  private service = inject(RefereeService);
  auth = inject(AuthService);

  items: Referee[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  search = '';
  sortBy: 'recent' | 'name' = 'name';
  selectedStatus: string | null = null;

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

  meta(status: string | null | undefined): StatusMeta {
    return (status && STATUS_META[status]) || FALLBACK_STATUS;
  }

  countByStatus(status: string): number {
    return this.items.filter((item) => item.status === status).length;
  }

  toggleStatus(status: string | null): void {
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

    const filtered = this.items.filter((item) => {
      const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
      const matchesSearch = !term || this.normalize(item.name).includes(term);
      return matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name, 'pt-BR');
      }

      return this.dateValue(b.birthDate) - this.dateValue(a.birthDate);
    });
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

  private dateValue(value: string | Date | null | undefined): number {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
