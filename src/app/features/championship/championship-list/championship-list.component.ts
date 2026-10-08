import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowDown, LucideAngularModule, Search, Trophy, X } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { ChampionshipService } from '../services/championship.service';
import { Championship } from '../../../models/championship.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

interface CategoryMeta {
  title: string;
  subtitle: string;
  badge: string;
  activeChip: string;
  dot: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  SUB_13: {
    title: 'Sub-13',
    subtitle: 'Base inicial',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    activeChip: 'border-blue-500/60 text-blue-700 dark:border-blue-400/60 dark:text-blue-400',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  SUB_15: {
    title: 'Sub-15',
    subtitle: 'Formação',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    activeChip:
      'border-emerald-500/60 text-emerald-700 dark:border-emerald-400/60 dark:text-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  SUB_17: {
    title: 'Sub-17',
    subtitle: 'Transição',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    activeChip: 'border-amber-500/60 text-amber-700 dark:border-amber-400/60 dark:text-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  SUB_20: {
    title: 'Sub-20',
    subtitle: 'Profissionalização',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    activeChip: 'border-rose-500/60 text-rose-700 dark:border-rose-400/60 dark:text-rose-400',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
};

const FALLBACK_META: CategoryMeta = {
  title: 'Outras',
  subtitle: 'Sem categoria definida',
  badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  activeChip: 'border-slate-400/60 text-slate-700 dark:border-white/30 dark:text-white/70',
  dot: 'bg-slate-400',
};

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './championship-list.component.html',
})
export class ChampionshipListComponent implements OnInit {
  private service = inject(ChampionshipService);
  private document = inject(DOCUMENT);
  auth = inject(AuthService);

  items: Championship[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  search = '';
  selectedCategory: string | null = null;

  readonly ArrowDownIcon = ArrowDown;
  readonly PencilIcon = Pencil;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly TrashIcon = Trash2;
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

  scrollToList(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.document
      .getElementById('campeonatos-lista')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  meta(category: string | null | undefined): CategoryMeta {
    return (category && CATEGORY_META[category]) || FALLBACK_META;
  }

  countByCategory(category: string): number {
    return this.items.filter((i) => i.category === category).length;
  }

  toggleCategory(category: string): void {
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

    return this.items
      .filter((item) => {
        const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
        const matchesSearch = !term || this.normalize(item.name).includes(term);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name, 'pt-BR'));
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
    return (value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
  }
}
