import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Info, Lock, Search, X } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ReportService } from '../services/report.service';
import { GameService } from '../../game/services/game.service';
import { ParticipationService } from '../../game/services/participation.service';
import { RefereeingService } from '../../game/services/refereeing.service';
import { Game } from '../../../models/game.model';
import { Referee } from '../../../models/referee.model';
import { Participation } from '../../../models/participation.model';
import { TicketModalComponent } from '../../../shared/components/ticket-modal/ticket-modal.component';
import { TeamBadgeComponent } from '../../../shared/components/team-badge/team-badge.component';

interface GameOption extends Game {
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  category: string;
  searchText: string;
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
  selector: 'app-report-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    TicketModalComponent,
    TeamBadgeComponent,
  ],
  templateUrl: './report-form.component.html',
})
export class ReportFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private gameService = inject(GameService);
  private participationSvc = inject(ParticipationService);
  private refereeingService = inject(RefereeingService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly MIN_LENGTH = 20;
  readonly MAX_LENGTH = 2000;
  readonly categories = ['SUB_13', 'SUB_15', 'SUB_17', 'SUB_20'] as const;

  readonly snippets = [
    'Minuto do lance: ',
    'O que aconteceu: ',
    'Decisão do árbitro: ',
  ];

  readonly tips = [
    'Informe o minuto aproximado e o lance que motivou a denúncia.',
    'Descreva fatos observáveis, sem suposições ou ofensas.',
    'Cite o que o árbitro decidiu e por que isso parece irregular.',
    'Mencione quem presenciou, se houver testemunhas.',
  ];

  readonly CheckIcon = Check;
  readonly InfoIcon = Info;
  readonly LockIcon = Lock;
  readonly SearchIcon = Search;
  readonly XIcon = X;

  loading = false;
  saving = false;
  loadingReferees = false;
  error = '';

  games: GameOption[] = [];
  filteredGames: GameOption[] = [];
  referees: Referee[] = [];

  search = '';
  categoryFilter: string | null = null;

  ticketVisible = false;
  ticketProtocolo = '';
  ticketEmail = '';

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    referee: this.fb.group({ id: [null as number | null, Validators.required] }),
    content: [
      '',
      [
        Validators.required,
        Validators.minLength(this.MIN_LENGTH),
        Validators.maxLength(this.MAX_LENGTH),
      ],
    ],
    analysisResult: [null],
  });

  get game() {
    return this.form.get('game.id')!;
  }
  get referee() {
    return this.form.get('referee.id')!;
  }
  get content() {
    return this.form.get('content')!;
  }

  get selectedGame(): GameOption | undefined {
    const id = this.game.value;
    return id ? this.games.find((g) => g.id === Number(id)) : undefined;
  }

  get selectedReferee(): Referee | undefined {
    const id = this.referee.value;
    return id ? this.referees.find((r) => r.id === Number(id)) : undefined;
  }

  get contentLength(): number {
    return (this.content.value ?? '').length;
  }

  get contentProgress(): number {
    return Math.min(100, Math.round((this.contentLength / this.MIN_LENGTH) * 100));
  }

  get completedSteps(): number {
    return [this.game.valid, this.referee.valid, this.content.valid].filter(Boolean).length;
  }

  ngOnInit(): void {
    this.loadGames();

    this.game.valueChanges
      .pipe(
        tap(() => {
          this.referees = [];
          this.referee.setValue(null, { emitEvent: false });
        }),
        switchMap((gameId) => {
          if (!gameId) {
            this.loadingReferees = false;
            return of(null);
          }

          this.loadingReferees = true;
          return this.refereeingService.getByGame(Number(gameId)).pipe(
            catchError(() => {
              this.error = 'Erro ao carregar árbitros da partida.';
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((refereeing) => {
        this.referees = refereeing ? refereeing.map((r) => r.referee) : [];
        this.loadingReferees = false;
      });
  }

  private loadGames(): void {
    this.loading = true;

    this.gameService.getAll().subscribe({
      next: (games) => this.enrichWithTeams(games),
      error: () => {
        this.error = 'Erro ao carregar partidas.';
        this.loading = false;
      },
    });
  }

  private enrichWithTeams(games: Game[]): void {
    if (games.length === 0) {
      this.games = [];
      this.applyFilters();
      this.loading = false;
      return;
    }

    const requests = games.map((game) =>
      this.participationSvc.getByGame(game.id!).pipe(catchError(() => of([] as Participation[]))),
    );

    forkJoin(requests).subscribe({
      next: (all) => {
        this.games = games
          .map((game, index) => {
            const home = all[index].find((p) => p.type === 'HOME');
            const away = all[index].find((p) => p.type === 'AWAY');
            const category = this.categoryOf(game);

            const option: GameOption = {
              ...game,
              homeTeamName: home?.team?.name,
              awayTeamName: away?.team?.name,
              homeTeamLogo: home?.team?.logoUrl ?? undefined,
              awayTeamLogo: away?.team?.logoUrl ?? undefined,
              category,
              searchText: this.normalize(
                [
                  home?.team?.name,
                  away?.team?.name,
                  game.championship?.name,
                  game.place,
                  category,
                ]
                  .filter(Boolean)
                  .join(' '),
              ),
            };
            return option;
          })
          .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar os times das partidas.';
        this.loading = false;
      },
    });
  }

  onSearch(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  toggleCategory(category: string): void {
    this.categoryFilter = this.categoryFilter === category ? null : category;
    this.applyFilters();
  }

  clearFilters(): void {
    this.search = '';
    this.categoryFilter = null;
    this.applyFilters();
  }

  countByCategory(category: string): number {
    return this.games.filter((g) => g.category === category).length;
  }

  private applyFilters(): void {
    const term = this.normalize(this.search);

    this.filteredGames = this.games.filter(
      (g) =>
        (!this.categoryFilter || g.category === this.categoryFilter) &&
        (!term || g.searchText.includes(term)),
    );
  }

  isGameSelected(game: GameOption): boolean {
    return Number(this.game.value) === game.id;
  }

  isRefereeSelected(referee: Referee): boolean {
    return Number(this.referee.value) === referee.id;
  }

  selectGame(game: GameOption): void {
    this.error = '';
    this.game.markAsTouched();

    if (this.isGameSelected(game)) {
      return;
    }
    this.game.setValue(game.id!);
  }

  selectReferee(referee: Referee): void {
    this.referee.setValue(referee.id!);
    this.referee.markAsTouched();
  }

  appendSnippet(snippet: string): void {
    const current = (this.content.value ?? '').trimEnd();
    this.content.setValue(current ? `${current}\n${snippet}` : snippet);
    this.content.markAsTouched();
  }

  meta(category: string | null | undefined): CategoryMeta {
    return (category && CATEGORY_META[category]) || FALLBACK_META;
  }

  initialOf(name: string | undefined): string {
    return (name ?? '?').trim().charAt(0).toUpperCase();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.saving = true;

    this.reportService.create(this.form.getRawValue() as any).subscribe({
      next: (response: any) => {
        this.ticketProtocolo = response.protocol;
        this.ticketEmail = response.email;
        this.ticketVisible = true;
        this.saving = false;
        this.form.reset();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }

  onTicketClosed(): void {
    this.ticketVisible = false;
    this.router.navigate(['/reports']);
  }

  private categoryOf(game: Game): string {
    return String(game.championship?.category ?? '');
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
  }
}
