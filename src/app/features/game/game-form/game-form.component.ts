import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GameService } from '../services/game.service';
import { ChampionshipService } from '../../championship/services/championship.service';
import { Championship } from '../../../models/championship.model';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './game-form.component.html',
})
export class GameFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private gameService = inject(GameService);
  private championshipSvc = inject(ChampionshipService);
  private router = inject(Router);

  loading = false;
  saving = false;
  error = '';
  isEdit = false;
  championships: Championship[] = [];

  form = this.fb.group({
    championship: this.fb.group({ id: [null as number | null, Validators.required] }),
    matchDate: ['', Validators.required],
    place: ['', Validators.required],
    homeScore: [0, [Validators.required, Validators.min(0)]],
    awayScore: [0, [Validators.required, Validators.min(0)]],
  });

  get championship() {
    return this.form.get('championship.id')!;
  }
  get matchDate() {
    return this.form.get('matchDate')!;
  }
  get place() {
    return this.form.get('place')!;
  }
  get homeScore() {
    return this.form.get('homeScore')!;
  }
  get awayScore() {
    return this.form.get('awayScore')!;
  }

  ngOnInit(): void {
    this.loading = true;
    if (this.id) this.isEdit = true;

    const load$ = this.isEdit
      ? forkJoin({
          championships: this.championshipSvc.getAll(),
          game: this.gameService.getById(Number(this.id)),
        })
      : forkJoin({ championships: this.championshipSvc.getAll() });

    load$.subscribe({
      next: (res: any) => {
        this.championships = res.championships;
        if (res.game) {
          this.form.patchValue({
            ...res.game,
            championship: { id: res.game.championship.id },
          });
        }
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
    const payload = this.form.getRawValue() as any;
    const req$ = this.isEdit
      ? this.gameService.update(Number(this.id), payload)
      : this.gameService.create(payload);
    req$.subscribe({
      next: () => this.router.navigate(['/games']),
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }
}
