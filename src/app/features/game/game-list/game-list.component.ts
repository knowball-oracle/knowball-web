import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
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
  statusLabel: string;
  isToday: boolean;
  isPast: boolean;
}

interface ChampionshipGroup {
  championshipId: number;
  championshipName: string;
  games: GameWithTeams[];
}

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
  private router = inject(Router);
  auth = inject(AuthService);

  groups: ChampionshipGroup[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly EyeIcon = Eye;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly ShieldIcon = Shield;
  readonly MapPinIcon = MapPin;

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

  /** Busca as participações de todas as partidas em paralelo e monta os grupos por campeonato. */
  private enrichWithTeams(games: Game[]): void {
    if (games.length === 0) {
      this.groups = [];
      this.loading = false;
      return;
    }

    const requests = games.map((g) =>
      this.participationSvc.getByGame(g.id!).pipe(catchError(() => of([] as Participation[]))),
    );

    forkJoin(requests).subscribe((allParticipations) => {
      const enriched: GameWithTeams[] = games.map((game, i) => {
        const parts = allParticipations[i];
        const home = parts.find((p) => p.type === 'HOME');
        const away = parts.find((p) => p.type === 'AWAY');
        return {
          ...game,
          homeTeamName: home?.team?.name,
          awayTeamName: away?.team?.name,
          ...this.resolveStatus(game.matchDate),
        };
      });

      this.groups = this.groupByChampionship(enriched);
      this.loading = false;
    });
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

    if (isToday) return { statusLabel: 'Hoje', isToday: true, isPast: false };
    if (isPast) return { statusLabel: 'Fim de jogo', isToday: false, isPast: true };
    return { statusLabel: 'Agendado', isToday: false, isPast: false };
  }

  private groupByChampionship(games: GameWithTeams[]): ChampionshipGroup[] {
    const map = new Map<number, ChampionshipGroup>();

    for (const game of games) {
      const id = game.championship.id!;
      if (!map.has(id)) {
        map.set(id, {
          championshipId: id,
          championshipName: game.championship.name,
          games: [],
        });
      }
      map.get(id)!.games.push(game);
    }

    for (const group of map.values()) {
      group.games.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
    }

    return Array.from(map.values());
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
