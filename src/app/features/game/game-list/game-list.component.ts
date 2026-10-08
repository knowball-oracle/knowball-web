import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArrowDown, LucideAngularModule, X } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Eye, Pencil, Trash2, Plus, Shield, MapPin } from '../../../shared/icons/icons';
import { GameService } from '../services/game.service';
import { ParticipationService } from '../services/participation.service';
import { Game } from '../../../models/game.model';
import { Participation } from '../../../models/participation.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { TeamBadgeComponent } from '../../../shared/components/team-badge/team-badge.component';

interface GameWithTeams extends Game {
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  statusLabel: string;
  isToday: boolean;
  isPast: boolean;
}

interface ChampionshipGroup {
  key: string;
  championshipName: string;
  year: number | null;
  categories: string[];
  games: GameWithTeams[];
}

interface CategoryMeta {
  badge: string;
  activeChip: string;
  dot: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  SUB_13: {
    badge: 'bg-blue-500/10 text-blue-400',
    activeChip: 'border-blue-400/60 text-blue-400',
    dot: 'bg-blue-400',
  },
  SUB_15: {
    badge: 'bg-emerald-500/10 text-emerald-400',
    activeChip: 'border-emerald-400/60 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  SUB_17: {
    badge: 'bg-amber-500/10 text-amber-400',
    activeChip: 'border-amber-400/60 text-amber-400',
    dot: 'bg-amber-400',
  },
  SUB_20: {
    badge: 'bg-rose-500/10 text-rose-400',
    activeChip: 'border-rose-400/60 text-rose-400',
    dot: 'bg-rose-400',
  },
};

const FALLBACK_META: CategoryMeta = {
  badge: 'bg-white/8 text-white/50',
  activeChip: 'border-white/30 text-white/70',
  dot: 'bg-slate-400',
};

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
    TeamBadgeComponent,
  ],
  templateUrl: './game-list.component.html',
})
export class GameListComponent implements OnInit {
  private service = inject(GameService);
  private participationSvc = inject(ParticipationService);
  private document = inject(DOCUMENT);
  auth = inject(AuthService);

  games: GameWithTeams[] = [];
  filteredGames: GameWithTeams[] = [];
  groups: ChampionshipGroup[] = [];

  selectedCategory: string | null = null;
  readonly categories = ['SUB_13', 'SUB_15', 'SUB_17', 'SUB_20'] as const;

  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly EyeIcon = Eye;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly ShieldIcon = Shield;
  readonly MapPinIcon = MapPin;
  readonly XIcon = X;
  readonly ArrowDownIcon = ArrowDown;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.service.getAll().subscribe({
      next: (games) => this.enrichWithTeams(games),
      error: () => {
        this.error = 'Erro ao carregar partidas.';
        this.loading = false;
      },
    });
  }

  meta(category: string | null | undefined): CategoryMeta {
    return (category && CATEGORY_META[category]) || FALLBACK_META;
  }

  categoryOf(game: Game): string {
    return String(game.championship?.category ?? '');
  }

  countByCategory(category: string): number {
    return this.games.filter((game) => this.categoryOf(game) === category).length;
  }

  toggleCategory(category: string | null): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.rebuild();
  }

  clearFilter(): void {
    this.selectedCategory = null;
    this.rebuild();
  }

  private enrichWithTeams(games: Game[]): void {
    if (games.length === 0) {
      this.games = [];
      this.rebuild();
      this.loading = false;
      return;
    }

    const requests = games.map((game) =>
      this.participationSvc.getByGame(game.id!).pipe(catchError(() => of([] as Participation[]))),
    );

    forkJoin(requests).subscribe({
      next: (allParticipations) => {
        this.games = games.map((game, index) => {
          const participations = allParticipations[index];
          const home = participations.find((participation) => participation.type === 'HOME');
          const away = participations.find((participation) => participation.type === 'AWAY');

          return {
            ...game,
            homeTeamName: home?.team?.name,
            awayTeamName: away?.team?.name,
            homeTeamLogo: home?.team?.logoUrl ?? undefined,
            awayTeamLogo: away?.team?.logoUrl ?? undefined,
            ...this.resolveStatus(game.matchDate),
          };
        });

        this.rebuild();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar os times participantes das partidas.';
        this.loading = false;
      },
    });
  }

  private rebuild(): void {
    this.filteredGames = this.selectedCategory
      ? this.games.filter((game) => this.categoryOf(game) === this.selectedCategory)
      : this.games;

    this.groups = this.groupByChampionship(this.filteredGames);
  }

  private resolveStatus(matchDate: string): {
    statusLabel: string;
    isToday: boolean;
    isPast: boolean;
  } {
    const date = new Date(matchDate);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isPast = date.getTime() < now.getTime() && !isToday;

    if (isToday) {
      return { statusLabel: 'Hoje', isToday: true, isPast: false };
    }

    if (isPast) {
      return { statusLabel: 'Fim de jogo', isToday: false, isPast: true };
    }

    return { statusLabel: 'Agendado', isToday: false, isPast: false };
  }

  private groupByChampionship(games: GameWithTeams[]): ChampionshipGroup[] {
    const map = new Map<string, ChampionshipGroup>();

    for (const game of games) {
      const name = game.championship?.name ?? 'Sem campeonato';
      const year = game.championship?.year ?? null;
      const key = `${this.normalize(name)}|${year ?? ''}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          championshipName: name,
          year,
          categories: [],
          games: [],
        });
      }

      const group = map.get(key)!;
      group.games.push(game);

      const category = this.categoryOf(game);
      if (category && !group.categories.includes(category)) {
        group.categories.push(category);
      }
    }

    for (const group of map.values()) {
      group.games.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
      group.categories.sort();
    }

    return Array.from(map.values()).sort((a, b) =>
      a.championshipName.localeCompare(b.championshipName, 'pt-BR'),
    );
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
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
        this.error = 'Erro ao excluir partida.';
        this.pendingDeleteId = null;
      },
    });
  }

  scrollToList(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.document.getElementById('partidas-lista')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}
