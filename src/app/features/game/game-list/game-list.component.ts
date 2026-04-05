import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Eye, Pencil, Trash2, Plus } from '../../../shared/icons/icons';
import { GameService } from '../services/game.service';
import { Game } from '../../../models/game.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './game-list.component.html',
})
export class GameListComponent implements OnInit {
  private service = inject(GameService);
  private router = inject(Router);

  items: Game[] = [];
  loading = true;
  error = '';
  pendingDeleteId: number | null = null;

  readonly EyeIcon = Eye;
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
        this.error = 'Erro ao carregar partidas.';
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
