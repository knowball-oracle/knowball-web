import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pencil, Trash2, Plus, Search } from '../../../shared/icons/icons';
import { UserService } from '../services/user.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse } from '../../../models/user-response.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private service = inject(UserService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  items: UserResponse[] = [];
  loading = true;
  error = '';
  totalPages = 0;
  currentPage = 0;
  pendingDeleteId: number | null = null;

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;

  filters = this.fb.group({ name: [''], email: [''] });

  ngOnInit(): void {
    this.load();
  }

  load(page = 0): void {
    this.loading = true;
    this.currentPage = page;
    const { name, email } = this.filters.value;
    this.service.getAll({ name: name ?? '', email: email ?? '' }, page).subscribe({
      next: (res: any) => {
        this.items = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar usuários.';
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
        this.load(this.currentPage);
      },
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  roleStyle(role: string): string {
    return role === 'ROLE_ADMIN' ? 'bg-purple-400/10 text-purple-400' : 'bg-white/8 text-white/40';
  }
}
