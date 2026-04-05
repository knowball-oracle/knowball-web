import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RefereeingService } from '../services/refereeing.service';
import { RefereeService } from '../../referee/services/referee.service';
import { Referee } from '../../../models/referee.model';
import { RefereeingRoleType } from '../../../models/refereeing-role.types';

@Component({
  selector: 'app-refereeing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './refereeing-form.component.html',
})
export class RefereeingFormComponent implements OnInit {
  @Input() gameId!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private refereeingService = inject(RefereeingService);
  private refereeService = inject(RefereeService);

  referees: Referee[] = [];
  roles = Object.values(RefereeingRoleType);
  saving = false;
  error = '';

  form = this.fb.group({
    game: this.fb.group({ id: [null as number | null, Validators.required] }),
    referee: this.fb.group({ id: [null as number | null, Validators.required] }),
    role: ['', Validators.required],
  });

  ngOnInit(): void {
    this.form.get('game.id')!.setValue(Number(this.gameId));
    this.refereeService.getAll().subscribe({ next: (r) => (this.referees = r) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.refereeingService.create(this.form.getRawValue() as any).subscribe({
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
