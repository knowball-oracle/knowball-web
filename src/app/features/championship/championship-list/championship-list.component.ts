import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { ChampionshipService } from '../services/championship.service';
import { Championship } from '../../../models/championship.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './championship-list.component.html',
})
export class ChampionshipListComponent implements OnInit {
  private service = inject(ChampionshipService);
  private router = inject(Router);
  auth = inject(AuthService);

  items: Championship[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar campeonatos.';
        this.loading = false;
      },
    });
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
