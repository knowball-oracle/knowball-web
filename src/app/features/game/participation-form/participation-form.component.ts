import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParticipationService } from '../services/participation.service';
import { TeamService } from '../../team/services/team.service';
import { Team } from '../../../models/team.model';
import { ParticipationType } from '../../../models';

@Component({
  selector: 'app-participation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './participation-form.component.html',
})
export class ParticipationFormComponent implements OnInit {
  @Input() gameId!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private participationService = inject(ParticipationService);
  private teamService = inject(TeamService);

  teams: Team[] = [];
  types = Object.values(ParticipationType);
  saving = false;
  error = '';

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    team: this.fb.group({ id: [null, Validators.required] }),
    type: ['', Validators.required],
  });

  ngOnInit(): void {
    this.form.get('game.id')!.setValue(Number(this.gameId));
    this.teamService.getAll().subscribe({ next: (t) => (this.teams = t) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.participationService.create(this.form.getRawValue() as any).subscribe({
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
