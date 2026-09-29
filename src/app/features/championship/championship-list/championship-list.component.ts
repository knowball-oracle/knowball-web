import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, Trophy, X } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { ChampionshipService } from '../services/championship.service';
import { Championship } from '../../../models/championship.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

interface CategoryMeta {
  title: string;
  subtitle: string;
  gradient: string;
  badge: string;
  activeChip: string;
  ring: string;
  dot: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  SUB_13: {
    title: 'Sub-13',
    subtitle: 'Base inicial',
    gradient: 'bg-linear-to-br from-blue-500 to-indigo-800',
    badge: 'bg-blue-500/10 text-blue-400',
    activeChip: 'border-blue-400/60 text-blue-400',
    ring: 'ring-blue-400/80',
    dot: 'bg-blue-400',
  },
  SUB_15: {
    title: 'Sub-15',
    subtitle: 'Formação',
    gradient: 'bg-linear-to-br from-emerald-500 to-teal-800',
    badge: 'bg-emerald-500/10 text-emerald-400',
    activeChip: 'border-emerald-400/60 text-emerald-400',
    ring: 'ring-emerald-400/80',
    dot: 'bg-emerald-400',
  },
  SUB_17: {
    title: 'Sub-17',
    subtitle: 'Transição',
    gradient: 'bg-linear-to-br from-amber-500 to-orange-800',
    badge: 'bg-amber-500/10 text-amber-400',
    activeChip: 'border-amber-400/60 text-amber-400',
    ring: 'ring-amber-400/80',
    dot: 'bg-amber-400',
  },
  SUB_20: {
    title: 'Sub-20',
    subtitle: 'Profissionalização',
    gradient: 'bg-linear-to-br from-rose-500 to-fuchsia-900',
    badge: 'bg-rose-500/10 text-rose-400',
    activeChip: 'border-rose-400/60 text-rose-400',
    ring: 'ring-rose-400/80',
    dot: 'bg-rose-400',
  },
};

const FALLBACK_META: CategoryMeta = {
  title: 'Outras',
  subtitle: 'Sem categoria definida',
  gradient: 'bg-linear-to-br from-slate-500 to-slate-800',
  badge: 'bg-slate-500/10 text-slate-300',
  activeChip: 'border-white/30 text-white/70',
  ring: 'ring-slate-400/80',
  dot: 'bg-slate-400',
};

interface ChampionshipGroup {
  key: string;
  meta: CategoryMeta;
  items: Championship[];
}

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './championship-list.component.html',
})
export class ChampionshipListComponent implements OnInit {
  private service = inject(ChampionshipService);
  auth = inject(AuthService);

  items: Championship[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  search = '';
  sortBy: 'recent' | 'name' = 'recent';
  selectedCategory: string | null = null;

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly TrophyIcon = Trophy;
  readonly XIcon = X;

  readonly categories = ['SUB_13', 'SUB_15', 'SUB_17', 'SUB_20'] as const;

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

  meta(category: string | null | undefined): CategoryMeta {
    return (category && CATEGORY_META[category]) || FALLBACK_META;
  }

  countByCategory(category: string): number {
    return this.items.filter((i) => i.category === category).length;
  }

  toggleCategory(category: string | null): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategory !== null || this.search.trim() !== '';
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.search = '';
  }

  get filteredItems(): Championship[] {
    const term = this.normalize(this.search);

    const filtered = this.items.filter((item) => {
      const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
      const matchesSearch = !term || this.normalize(item.name).includes(term);
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      return b.year - a.year || a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  get groups(): ChampionshipGroup[] {
    const list = this.filteredItems;
    const keys = this.selectedCategory ? [this.selectedCategory] : [...this.categories];

    const groups: ChampionshipGroup[] = keys
      .map((key) => ({
        key,
        meta: this.meta(key),
        items: list.filter((i) => i.category === key),
      }))
      .filter((g) => g.items.length > 0);

    const known = new Set<string>(this.categories);
    const others = list.filter((i) => !known.has(i.category as string));
    if (!this.selectedCategory && others.length > 0) {
      groups.push({ key: 'OTHERS', meta: FALLBACK_META, items: others });
    }

    return groups;
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

  private normalize(value: string | null | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  }
}
