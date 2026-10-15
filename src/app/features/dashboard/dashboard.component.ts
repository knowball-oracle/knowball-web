import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
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
import { LucideAngularModule } from 'lucide-angular';
import {
  ChartComponent,
  type ApexAxisChartSeries,
  type ApexChart,
  type ApexDataLabels,
  type ApexFill,
  type ApexGrid,
  type ApexLegend,
  type ApexNonAxisChartSeries,
  type ApexPlotOptions,
  type ApexStroke,
  type ApexTheme,
  type ApexTooltip,
  type ApexXAxis,
  type ApexYAxis,
} from 'ng-apexcharts';
import {
  Subject,
  catchError,
  defer,
  exhaustMap,
  filter,
  forkJoin,
  fromEvent,
  map,
  merge,
  of,
  timeout,
  timer,
} from 'rxjs';

import {
  ArrowRight,
  Calendar,
  FileWarning,
  MapPin,
  ShieldCheck,
  Swords,
  Trophy,
  Users2,
  type LucideIconData,
} from '../../shared/icons/icons';

import { AuthService } from '../../core/services/auth.service';
import { Championship } from '../../models/championship.model';
import { Game } from '../../models/game.model';
import { Referee } from '../../models/referee.model';
import { Report } from '../../models/report.model';
import { Team } from '../../models/team.model';

import { ChampionshipService } from '../championship/services/championship.service';
import { GameService } from '../game/services/game.service';
import { RefereeService } from '../referee/services/referee.service';
import { TeamService } from '../team/services/team.service';
import { ReportService } from '../report/services/report.service';

interface DashboardData {
  championships: Championship[];
  games: Game[];
  referees: Referee[];
  teams: Team[];
  reports: Report[];
}

interface StatCard {
  label: string;
  count: number;
  path: string;
  icon: LucideIconData;
}

interface StatusItem {
  key: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

interface MonthlyPoint {
  key: string;
  label: string;
  count: number;
}

interface RankingPoint {
  key: string;
  label: string;
  count: number;
}

interface CategoryPoint {
  key: string;
  label: string;
  count: number;
}

type SnapshotResult = { ok: true; data: DashboardData } | { ok: false };

const STATUS_CONFIG = [
  { key: 'NEW', label: 'Novas', color: '#60A5FA' },
  { key: 'UNDER_REVIEW', label: 'Em análise', color: '#FBBF24' },
  { key: 'RESOLVED', label: 'Resolvidas', color: '#34D399' },
  { key: 'OTHER', label: 'Outros', color: '#A3A3A3' },
];

const CATEGORY_CONFIG = [
  { key: 'SUB_13', label: 'Sub-13' },
  { key: 'SUB_15', label: 'Sub-15' },
  { key: 'SUB_17', label: 'Sub-17' },
  { key: 'SUB_20', label: 'Sub-20' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly championshipSvc = inject(ChampionshipService);
  private readonly gameSvc = inject(GameService);
  private readonly refereeSvc = inject(RefereeService);
  private readonly teamSvc = inject(TeamService);
  private readonly reportSvc = inject(ReportService);

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly refreshRequests = new Subject<void>();

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly user = this.auth.user;

  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly error = signal('');
  readonly lastUpdated = signal<Date | null>(null);
  readonly months = signal(6);

  readonly data = signal<DashboardData | null>(null);

  readonly ArrowRightIcon = ArrowRight;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly ReportIcon = FileWarning;

  readonly firstName = computed(() => {
    const name = this.user()?.name?.trim();
    return name ? name.split(/\s+/)[0] : 'Usuário';
  });

  readonly isAdmin = computed(() => this.auth.isAdmin());

  readonly scopeLabel = computed(() =>
    this.isAdmin() ? 'Visão administrativa das denúncias' : 'Acompanhamento das suas denúncias',
  );

  readonly totalReports = computed(() => this.data()?.reports.length ?? 0);

  readonly newCount = computed(() => this.countReports('NEW'));

  readonly reviewingCount = computed(() => this.countReports('UNDER_REVIEW'));

  readonly resolvedCount = computed(() => this.countReports('RESOLVED'));

  readonly pendingCount = computed(() => this.newCount() + this.reviewingCount());

  readonly resolvedPercentage = computed(() => {
    const total = this.totalReports();

    return total > 0 ? (this.resolvedCount() / total) * 100 : 0;
  });

  readonly stats = computed<StatCard[]>(() => {
    const snapshot = this.data();

    if (!snapshot) {
      return [];
    }

    return [
      {
        label: 'Campeonatos',
        count: snapshot.championships.length,
        path: '/championships',
        icon: Trophy,
      },
      {
        label: 'Partidas',
        count: snapshot.games.length,
        path: '/games',
        icon: Swords,
      },
      {
        label: 'Árbitros ativos',
        count: snapshot.referees.filter((item) => item.status === 'ACTIVE').length,
        path: '/referees',
        icon: ShieldCheck,
      },
      {
        label: 'Times',
        count: snapshot.teams.length,
        path: '/teams',
        icon: Users2,
      },
    ];
  });

  readonly statusItems = computed<StatusItem[]>(() => {
    const reports = this.data()?.reports ?? [];
    const total = reports.length;
    const knownStatuses = ['NEW', 'UNDER_REVIEW', 'RESOLVED'];

    return STATUS_CONFIG.map((item) => {
      const count = reports.filter((report) =>
        item.key === 'OTHER' ? !knownStatuses.includes(report.status) : report.status === item.key,
      ).length;

      return {
        ...item,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      };
    }).filter((item) => item.key !== 'OTHER' || item.count > 0);
  });

  readonly statusSeries = computed<ApexNonAxisChartSeries>(() =>
    this.statusItems().map((item) => item.count),
  );

  readonly statusLabels = computed(() => this.statusItems().map((item) => item.label));

  readonly statusColors = computed(() => this.statusItems().map((item) => item.color));

  private readonly reportMonthFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
  });

  readonly monthlyPoints = computed<MonthlyPoint[]>(() => {
    const reference = this.lastUpdated() ?? new Date();
    const currentKey = this.monthKey(reference);
    const [year, month] = currentKey.split('-').map(Number);

    const counts = new Map<string, number>();

    for (const report of this.data()?.reports ?? []) {
      const date = new Date(report.date);

      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const key = this.monthKey(date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from({ length: this.months() }, (_, index) => {
      const date = new Date(Date.UTC(year, month - this.months() + index, 1));

      const key = [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, '0')].join(
        '-',
      );

      return {
        key,
        label: date.toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
          timeZone: 'UTC',
        }),
        count: counts.get(key) ?? 0,
      };
    });
  });

  readonly monthlyTotal = computed(() =>
    this.monthlyPoints().reduce((sum, point) => sum + point.count, 0),
  );

  readonly monthlySeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Denúncias',
      data: this.monthlyPoints().map((point) => point.count),
    },
  ]);

  readonly monthlyXAxis = computed<ApexXAxis>(() => ({
    categories: this.monthlyPoints().map((point) => point.label),
    labels: {
      style: { colors: '#A3A3A3', fontSize: '11px' },
      rotate: -35,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  }));

  readonly championshipRanking = computed<RankingPoint[]>(() => {
    const groups = new Map<string, RankingPoint>();

    for (const game of this.data()?.games ?? []) {
      const championship = game.championship;
      const key =
        championship?.id != null
          ? String(championship.id)
          : `${championship?.name}|${championship?.year}|${championship?.category}`;

      const label = championship
        ? `${championship.name} · ${championship.year} · ${String(
            championship.category ?? '',
          ).replace('SUB_', 'Sub-')}`
        : 'Sem campeonato';

      const current = groups.get(key);

      if (current) {
        current.count++;
      } else {
        groups.set(key, { key, label, count: 1 });
      }
    }

    return [...groups.values()]
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))
      .slice(0, 5);
  });

  readonly championshipSeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Partidas',
      data: this.championshipRanking().map((item) => item.count),
    },
  ]);

  readonly championshipXAxis = computed<ApexXAxis>(() => ({
    categories: this.championshipRanking().map((item) => item.label),
    labels: {
      style: { colors: '#A3A3A3' },
      formatter: (value: string) => this.integerLabel(Number(value)),
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  readonly categoryPoints = computed<CategoryPoint[]>(() => {
    const counts = new Map<string, number>(CATEGORY_CONFIG.map((item) => [item.key, 0]));

    for (const report of this.data()?.reports ?? []) {
      const category = String(report.game?.championship?.category ?? '');
      const key = counts.has(category) ? category : 'OTHER';

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const points = CATEGORY_CONFIG.map((item) => ({
      ...item,
      count: counts.get(item.key) ?? 0,
    }));

    if (counts.has('OTHER')) {
      points.push({
        key: 'OTHER',
        label: 'Outras',
        count: counts.get('OTHER') ?? 0,
      });
    }

    return points;
  });

  readonly categorySeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Denúncias',
      data: this.categoryPoints().map((item) => item.count),
    },
  ]);

  readonly categoryXAxis = computed<ApexXAxis>(() => ({
    categories: this.categoryPoints().map((item) => item.label),
    labels: { style: { colors: '#A3A3A3' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  readonly recentGames = computed(() =>
    [...(this.data()?.games ?? [])]
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, 4),
  );

  readonly pendingReports = computed(() =>
    (this.data()?.reports ?? [])
      .filter((report) => report.status === 'NEW' || report.status === 'UNDER_REVIEW')
      .sort((a, b) => {
        const priority = Number(b.status === 'NEW') - Number(a.status === 'NEW');

        return priority || new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 5),
  );

  readonly theme: ApexTheme = { mode: 'dark' };
  readonly legend: ApexLegend = { show: false };

  readonly grid: ApexGrid = {
    borderColor: 'rgba(255,255,255,0.08)',
    strokeDashArray: 4,
    padding: { left: 8, right: 12 },
  };

  readonly axisDataLabels: ApexDataLabels = { enabled: false };

  readonly donutDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (value: number) => `${value.toFixed(1).replace('.', ',')}%`,
    style: {
      fontSize: '12px',
      colors: ['#111111'],
    },
    dropShadow: { enabled: false },
  };

  readonly donutOptions: ApexPlotOptions = {
    pie: {
      donut: { size: '72%' },
    },
  };

  readonly horizontalBarOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '48%',
    },
  };

  readonly verticalBarOptions: ApexPlotOptions = {
    bar: {
      borderRadius: 5,
      columnWidth: '42%',
    },
  };

  readonly monthlyStroke: ApexStroke = {
    curve: 'straight',
    width: 3,
  };

  readonly donutStroke: ApexStroke = {
    width: 3,
    colors: ['#111111'],
  };

  readonly monthlyFill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.35,
      opacityTo: 0.03,
      stops: [0, 100],
    },
  };

  readonly numericYAxis: ApexYAxis = {
    min: 0,
    decimalsInFloat: 0,
    labels: {
      style: { colors: '#A3A3A3' },
      formatter: (value: number) => this.integerLabel(value),
    },
  };

  readonly rankingYAxis: ApexYAxis = {
    labels: {
      maxWidth: 190,
      style: { colors: '#D4D4D4', fontSize: '11px' },
    },
  };

  readonly axisTooltip: ApexTooltip = {
    theme: 'dark',
    y: {
      formatter: (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
    },
  };

  readonly donutTooltip: ApexTooltip = {
    theme: 'dark',
    y: {
      formatter: (value: number) => {
        const total = this.totalReports();
        const percentage = total > 0 ? (value / total) * 100 : 0;

        return `${value} denúncia(s) · ${percentage.toLocaleString('pt-BR', {
          maximumFractionDigits: 1,
        })}%`;
      },
    },
  };

  readonly blueColors = ['#60A5FA'];
  readonly greenColors = ['#34D399'];
  readonly purpleColors = ['#A78BFA'];

  readonly donutChart = this.chartConfig('donut', 270);
  readonly monthlyChart = this.chartConfig('area', 290);
  readonly rankingChart = this.chartConfig('bar', 320);
  readonly categoryChart = this.chartConfig('bar', 290);

  constructor() {
    if (!this.isBrowser) {
      this.loading.set(false);
      return;
    }

    const intervalRefresh = timer(0, 30_000).pipe(filter(() => !this.document.hidden));

    const visibilityRefresh = fromEvent(this.document, 'visibilitychange').pipe(
      filter(() => !this.document.hidden),
    );

    merge(intervalRefresh, visibilityRefresh, this.refreshRequests)
      .pipe(
        exhaustMap(() => this.fetchSnapshot()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result.ok) {
          this.data.set(result.data);
          this.lastUpdated.set(new Date());
          this.error.set('');
        } else {
          this.error.set(
            this.data()
              ? 'Não foi possível atualizar agora. Exibindo a última consulta bem-sucedida.'
              : 'Não foi possível carregar o dashboard. Tente novamente.',
          );
        }

        this.loading.set(false);
        this.refreshing.set(false);
      });
  }

  refresh(): void {
    this.refreshRequests.next();
  }

  changeMonths(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);

    if (value === 6 || value === 12) {
      this.months.set(value);
    }
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      NEW: 'Nova',
      UNDER_REVIEW: 'Em análise',
      RESOLVED: 'Resolvida',
    };

    return labels[status] ?? 'Outro status';
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      NEW: 'bg-blue-400/10 text-blue-300',
      UNDER_REVIEW: 'bg-amber-400/10 text-amber-300',
      RESOLVED: 'bg-emerald-400/10 text-emerald-300',
    };

    return classes[status] ?? 'bg-white/5 text-white/60';
  }

  private fetchSnapshot() {
    return defer(() => {
      this.refreshing.set(true);

      return forkJoin({
        championships: this.championshipSvc.getAll(),
        games: this.gameSvc.getAll(),
        referees: this.refereeSvc.getAll(),
        teams: this.teamSvc.getAll(),
        reports: this.reportSvc.getAll(),
      });
    }).pipe(
      timeout(60_000),
      map((data): SnapshotResult => ({ ok: true, data })),
      catchError(() => of<SnapshotResult>({ ok: false })),
    );
  }

  private countReports(status: string): number {
    return (this.data()?.reports ?? []).filter((report) => report.status === status).length;
  }

  private monthKey(date: Date): string {
    const parts = this.reportMonthFormatter.formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;

    return `${year}-${month}`;
  }

  private integerLabel(value: number): string {
    return Number.isInteger(value) ? value.toLocaleString('pt-BR') : '';
  }

  private chartConfig(type: 'donut' | 'area' | 'bar', height: number): ApexChart {
    return {
      type,
      height,
      background: 'transparent',
      foreColor: '#A3A3A3',
      fontFamily: 'Sora, sans-serif',
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
    };
  }
}
