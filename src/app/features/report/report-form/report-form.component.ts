import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReportService } from '../services/report.service';
import { GameService } from '../../game/services/game.service';
import { Game } from '../../../models/game.model';
import { Referee } from '../../../models/referee.model';
import { ReportStatusType } from '../../../models/report-status.types';
import { RefereeingService } from '../../game/services/refereeing.service';
import { TicketModalComponent } from '../../../shared/components/ticket-modal/ticket-modal.component';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TicketModalComponent],
  templateUrl: './report-form.component.html',
})
export class ReportFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private gameService = inject(GameService);
  private refereeingService = inject(RefereeingService);
  private router = inject(Router);

  loading = false;
  saving = false;
  loadingReferees = false;
  error = '';
  games: Game[] = [];
  referees: Referee[] = [];
  statuses = Object.values(ReportStatusType);
  ticketVisible = false;
  ticketProtocolo = '';

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    referee: this.fb.group({ id: [null as number | null, Validators.required] }),
    content: ['', [Validators.required, Validators.minLength(20)]],
    date: ['', Validators.required],
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
  get date() {
    return this.form.get('date')!;
  }

  ngOnInit(): void {
    this.loading = true;
    this.gameService.getAll().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar partidas.';
        this.loading = false;
      },
    });

    this.game.valueChanges.subscribe((gameId) => {
      this.referees = [];
      this.form.get('referee.id')!.setValue(null);

      if (!gameId) {
        this.form.get('date')!.reset();
        this.form.get('date')!.enable();
        return;
      }

      const selectedGame = this.games.find((g) => g.id === Number(gameId));

      if (selectedGame && selectedGame.matchDate) {
        const d = new Date(selectedGame.matchDate);
        const iso = d.toISOString().substring(0, 10);

        this.form.get('date')!.setValue(iso);
        this.form.get('date')!.disable();
      }

      this.loadingReferees = true;
      this.refereeingService.getByGame(Number(gameId)).subscribe({
        next: (refereeing) => {
          this.referees = refereeing.map((r) => r.referee);
          this.loadingReferees = false;
        },
        error: () => {
          this.error = 'Erro ao carregar árbitros da partida.';
          this.loadingReferees = false;
        },
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.reportService.create(this.form.getRawValue() as any).subscribe({
      next: (response: any) => {
        this.ticketProtocolo = response.protocol;
        this.ticketVisible = true;
        this.saving = false;
        this.form.reset();
      },
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }

  onTicketClosed(): void {
    this.ticketVisible = false;
    this.router.navigate(['/reports']);
  }
}
