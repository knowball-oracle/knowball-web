import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ContactSectionComponent } from '../../../shared/components/contact-section/contact-section.component';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  Subject,
  catchError,
  defer,
  exhaustMap,
  filter,
  fromEvent,
  map,
  merge,
  of,
  timeout,
  timer,
} from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { Report } from '../../../models/report.model';
import { ReportService } from '../../report/services/report.service';

interface ReportSummary {
  key: string;
  label: string;
  count: number;
  accent: string;
}

type LoadResult = { ok: true; reports: Report[] } | { ok: false };

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ContactSectionComponent],
  templateUrl: './user-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly reportService = inject(ReportService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly refreshRequests = new Subject<void>();

  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly error = signal('');
  readonly lastUpdated = signal<Date | null>(null);
  readonly reports = signal<Report[]>([]);

  readonly firstName = computed(() => {
    const name = this.auth.user()?.name?.trim();

    return name ? name.split(/\s+/)[0] : 'Usuário';
  });

  readonly summary = computed<ReportSummary[]>(() => {
    const reports = this.reports();

    return [
      {
        key: 'TOTAL',
        label: 'Registradas',
        count: reports.length,
        accent: 'text-white',
      },
      {
        key: 'NEW',
        label: 'Novas',
        count: reports.filter((report) => report.status === 'NEW').length,
        accent: 'text-blue-300',
      },
      {
        key: 'UNDER_REVIEW',
        label: 'Em análise',
        count: reports.filter((report) => report.status === 'UNDER_REVIEW').length,
        accent: 'text-amber-300',
      },
      {
        key: 'RESOLVED',
        label: 'Resolvidas',
        count: reports.filter((report) => report.status === 'RESOLVED').length,
        accent: 'text-emerald-300',
      },
    ];
  });

  readonly recentReports = computed(() =>
    [...this.reports()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    const periodicRefresh = timer(0, 30_000).pipe(filter(() => !this.document.hidden));

    const visibilityRefresh = fromEvent(this.document, 'visibilitychange').pipe(
      filter(() => !this.document.hidden),
    );

    merge(periodicRefresh, visibilityRefresh, this.refreshRequests)
      .pipe(
        exhaustMap(() => this.fetchReports()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result.ok) {
          this.reports.set(result.reports);
          this.lastUpdated.set(new Date());
          this.error.set('');
        } else {
          this.error.set(
            this.lastUpdated()
              ? 'Não foi possível atualizar. Mantivemos os dados da última consulta.'
              : 'Não foi possível carregar suas denúncias. Tente novamente.',
          );
        }

        this.loading.set(false);
        this.refreshing.set(false);
      });
  }

  greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Bom dia';
    }

    if (hour < 18) {
      return 'Boa tarde';
    }

    return 'Boa noite';
  }

  refresh(): void {
    this.refreshRequests.next();
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      NEW: 'Nova',
      UNDER_REVIEW: 'Em análise',
      RESOLVED: 'Resolvida',
    };

    return labels[status] ?? 'Status não informado';
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      NEW: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
      UNDER_REVIEW: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
      RESOLVED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    };

    return classes[status] ?? 'border-white/10 bg-white/5 text-white/60';
  }

  private fetchReports() {
    return defer(() => {
      this.refreshing.set(true);

      return this.reportService.getAll();
    }).pipe(
      timeout(60_000),
      map((reports): LoadResult => ({ ok: true, reports })),
      catchError(() => of<LoadResult>({ ok: false })),
    );
  }
}
