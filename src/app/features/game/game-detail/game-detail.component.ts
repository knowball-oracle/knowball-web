import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Plus, X } from '../../../shared/icons/icons';
import { GameService } from '../services/game.service';
import { ParticipationService } from '../services/participation.service';
import { RefereeingService } from '../services/refereeing.service';
import { Game } from '../../../models/game.model';
import { Participation } from '../../../models/participation.model';
import { Refereeing } from '../../../models/refereeing.model';
import { ParticipationFormComponent } from '../participation-form/participation-form.component';
import { RefereeingFormComponent } from '../refereeing-form/refereeing-form.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    ParticipationFormComponent,
    RefereeingFormComponent,
  ],
  templateUrl: './game-detail.component.html',
})
export class GameDetailComponent implements OnInit {
  @Input() id!: string;

  private gameSvc = inject(GameService);
  private participationSvc = inject(ParticipationService);
  private refereeingSvc = inject(RefereeingService);
  auth = inject(AuthService);

  game: Game | null = null;
  participations: Participation[] = [];
  refereeings: Refereeing[] = [];
  loading = true;
  error = '';
  showParticipationForm = false;
  showRefereeingForm = false;

  readonly PlusIcon = Plus;
  readonly XIcon = X;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.gameSvc.getById(Number(this.id)).subscribe({
      next: (game) => {
        this.game = game;
        this.loadRelations();
      },
      error: () => {
        this.error = 'Erro ao carregar partida.';
        this.loading = false;
      },
    });
  }

  loadRelations(): void {
    this.participationSvc.getByGame(Number(this.id)).subscribe((p) => (this.participations = p));
    this.refereeingSvc.getByGame(Number(this.id)).subscribe((r) => {
      this.refereeings = r;
      this.loading = false;
    });
  }

  onParticipationSaved(): void {
    this.showParticipationForm = false;
    this.participationSvc.getByGame(Number(this.id)).subscribe((p) => (this.participations = p));
  }

  onRefereeingSaved(): void {
    this.showRefereeingForm = false;
    this.refereeingSvc.getByGame(Number(this.id)).subscribe((r) => (this.refereeings = r));
  }

  participationTypeStyle(type: string): string {
    return type === 'HOME' ? 'bg-blue-400/10 text-blue-400' : 'bg-orange-400/10 text-orange-400';
  }

  roleStyle(role: string): string {
    const map: Record<string, string> = {
      MAIN: 'bg-amber-400/10 text-amber-400',
      ASSISTANT_1: 'bg-white/8 text-white/50',
      ASSISTANT_2: 'bg-white/8 text-white/50',
      FOURTH_REFEREE: 'bg-white/8 text-white/50',
    };
    return map[role] ?? 'bg-white/8 text-white/50';
  }
}
