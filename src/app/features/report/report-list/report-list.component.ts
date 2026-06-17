  import { Component, inject, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterLink } from '@angular/router';
  import { LucideAngularModule } from 'lucide-angular';
  import { Eye, Plus, Search } from '../../../shared/icons/icons';
  import { ReportService } from '../services/report.service';
  import { Report } from '../../../models/report.model';
  import { AuthService } from '../../../core/services/auth.service';
  import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

  @Component({
    selector: 'app-report-list',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule, ReactiveFormsModule],
    templateUrl: './report-list.component.html',
  })
  export class ReportListComponent implements OnInit {
    private service = inject(ReportService);
    auth = inject(AuthService);
    private fb = inject(FormBuilder);

    items: Report[] = [];
    allItems: Report[] = [];
    loading = true;
    error = '';

    readonly EyeIcon = Eye;
    readonly PlusIcon = Plus;
    readonly SearchIcon = Search;

    filters = this.fb.group({
      protocol: [''],
      status: [''],
    });

    ngOnInit(): void {
      this.load();

      this.filters.valueChanges.subscribe(() => this.applyFilters());
    }

    load(): void {
      this.loading = true;
      this.service.getAll().subscribe({
        next: (data) => {
          this.allItems = data;
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.error = 'Erro ao carregar denúncias.';
          this.loading = false;
        },
      });
    }

    applyFilters(): void {
      const { protocol, status } = this.filters.getRawValue();

      this.items = this.allItems.filter((item) => {
        const matchProtocol =
          !protocol ||
          (item.protocol && item.protocol.toLowerCase().includes(protocol.toLowerCase()));

        const matchStatus = !status || item.status === status;

        return matchProtocol && matchStatus;
      });
    }

    onFilterSubmit(): void {
      this.applyFilters();
    }

    statusStyle(status: string): string {
      const map: Record<string, string> = {
        NEW: 'bg-blue-400/10 text-blue-400',
        UNDER_REVIEW: 'bg-amber-400/10 text-amber-400',
        RESOLVED: 'bg-emerald-400/10 text-emerald-400',
      };
      return map[status] ?? 'bg-white/8 text-white/40';
    }

    resultStyle(result: string): string {
      const map: Record<string, string> = {
        POSITIVE: 'bg-emerald-400/10 text-emerald-400',
        NEUTRAL: 'bg-white/8 text-white/40',
        NEGATIVE: 'bg-red-400/10 text-red-400',
      };
      return map[result] ?? '';
    }
  }

