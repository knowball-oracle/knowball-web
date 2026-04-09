import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReportService } from '../services/report.service';
import { GameService } from '../../game/services/game.service';
import { RefereeService } from '../../referee/services/referee.service';
import { Game } from '../../../models/game.model';
import { Referee } from '../../../models/referee.model';
import { ReportStatusType } from '../../../models/report-status.types';
import { UserOnlyGuard } from '../../../core/guards/user-only.guard';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './report-form.component.html',
})
export class ReportFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private gameService = inject(GameService);
  private refereeService = inject(RefereeService);
  private router = inject(Router);

  loading = false;
  saving = false;
  error = '';
  games: Game[] = [];
  referees: Referee[] = [];
  statuses = Object.values(ReportStatusType);

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    referee: this.fb.group({ id: [null as number | null, Validators.required] }),
    protocol: ['', Validators.required],
    content: ['', [Validators.required, Validators.minLength(20)]],
    date: ['', Validators.required],
    status: ['NEW', Validators.required],
    analysisResult: [null],
  });

  get game() {
    return this.form.get('game.id')!;
  }
  get referee() {
    return this.form.get('referee.id')!;
  }
  get protocol() {
    return this.form.get('protocol')!;
  }
  get content() {
    return this.form.get('content')!;
  }
  get date() {
    return this.form.get('date')!;
  }

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      games: this.gameService.getAll(),
      referees: this.refereeService.getAll(),
    }).subscribe({
      next: (data) => {
        this.games = data.games;
        this.referees = data.referees;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar dados.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.reportService.create(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/reports']),
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }
}
