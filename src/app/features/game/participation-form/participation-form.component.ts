import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParticipationService } from '../services/participation.service';
import { TeamService } from '../../team/services/team.service';
import { Team } from '../../../models/team.model';
import { Participation } from '../../../models/participation.model';
import { ParticipationType } from '../../../models';

@Component({
  selector: 'app-participation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './participation-form.component.html',
})
export class ParticipationFormComponent implements OnInit {
  @Input() gameId!: string;
  @Input() existingParticipations: Participation[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private participationService = inject(ParticipationService);
  private teamService = inject(TeamService);

  teams: Team[] = [];
  saving = false;
  error = '';

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    team: this.fb.group({ id: [null as number | null, Validators.required] }),
    type: ['', Validators.required],
  });

  get availableTypes(): string[] {
    const usedTypes = this.existingParticipations.map((p) => p.type);
    return Object.values(ParticipationType).filter((t) => !usedTypes.includes(t));
  }

  get availableTeams(): Team[] {
    const usedTeamIds = this.existingParticipations.map((p) => p.team.id);
    return this.teams.filter((t) => !usedTeamIds.includes(t.id));
  }

  get isFull(): boolean {
    return this.existingParticipations.length >= 2;
  }

  ngOnInit(): void {
    this.form.get('game.id')!.setValue(Number(this.gameId));
    this.teamService.getAll().subscribe({ next: (t) => (this.teams = t) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.isFull) {
      this.error = 'A partida já possui os dois times cadastrados.';
      return;
    }

    const payload = this.form.getRawValue() as any;
    const selectedType = payload.type;
    const selectedTeamId = payload.team?.id;

    const typeJaUsado = this.existingParticipations.some((p) => p.type === selectedType);
    if (typeJaUsado) {
      this.error = `Já existe um time cadastrado como ${selectedType}.`;
      return;
    }

    const timeJaVinculado = this.existingParticipations.some((p) => p.team.id === selectedTeamId);
    if (timeJaVinculado) {
      this.error = 'Este time já está vinculado a esta partida.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.participationService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
      },
      error: () => {
        this.error = 'Erro ao salvar.';
        this.saving = false;
      },
    });
  }
}
