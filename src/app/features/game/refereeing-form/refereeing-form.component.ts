import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RefereeingService } from '../services/refereeing.service';
import { RefereeService } from '../../referee/services/referee.service';
import { Referee } from '../../../models/referee.model';
import { Refereeing } from '../../../models/refereeing.model';
import { RefereeingRoleType } from '../../../models/refereeing-role.types';

@Component({
  selector: 'app-refereeing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './refereeing-form.component.html',
})
export class RefereeingFormComponent implements OnInit {
  @Input() gameId!: string;
  @Input() existingRefereeings: Refereeing[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private refereeingService = inject(RefereeingService);
  private refereeService = inject(RefereeService);

  referees: Referee[] = [];
  saving = false;
  error = '';

  readonly roleLabels: Record<string, string> = {
    MAIN: 'Principal',
    ASSISTANT_1: 'Assistente 1',
    ASSISTANT_2: 'Assistente 2',
    FOURTH_REFEREE: 'Quarto Árbitro',
  };

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    referee: this.fb.group({ id: [null as number | null, Validators.required] }),
    role: ['', Validators.required],
  });

  get availableRoles(): string[] {
    const usedRoles = this.existingRefereeings.map((r) => r.role);
    return Object.values(RefereeingRoleType).filter((r) => !usedRoles.includes(r));
  }

  get availableReferees(): Referee[] {
    const usedIds = this.existingRefereeings.map((r) => r.referee.id);
    return this.referees.filter((r) => !usedIds.includes(r.id));
  }

  get isFull(): boolean {
    return this.existingRefereeings.length >= 4;
  }

  ngOnInit(): void {
    this.form.get('game.id')!.setValue(Number(this.gameId));
    this.refereeService.getAll().subscribe({ next: (r) => (this.referees = r) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.isFull) {
      this.error = 'A partida já possui os 4 árbitros cadastrados.';
      return;
    }

    const payload = this.form.getRawValue() as any;
    const selectedRole = payload.role;
    const selectedRefId = payload.referee?.id;

    const funcaoJaUsada = this.existingRefereeings.some((r) => r.role === selectedRole);
    if (funcaoJaUsada) {
      this.error = `A função "${this.roleLabels[selectedRole]}" já está atribuída.`;
      return;
    }

    const arbitroJaVinculado = this.existingRefereeings.some((r) => r.referee.id === selectedRefId);
    if (arbitroJaVinculado) {
      this.error = 'Este árbitro já está cadastrado nesta partida.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.refereeingService.create(payload).subscribe({
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
