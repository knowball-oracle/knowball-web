import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Trophy,
  Swords,
  ShieldCheck,
  Users2,
  FileWarning,
  Users,
  ArrowRight,
  TrendingUp,
  Calendar,
  MapPin,
  type LucideIconData,
} from '../../shared/icons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ChampionshipService } from '../championship/services/championship.service';
import { GameService } from '../game/services/game.service';
import { RefereeService } from '../referee/services/referee.service';
import { TeamService } from '../team/services/team.service';
import { ReportService } from '../report/services/report.service';

interface StatCard {
  label: string;
  count: number;
  icon: LucideIconData;
  accent: string;
  path: string;
}

interface NavCard {
  path: string;
  label: string;
  description: string;
  icon: LucideIconData;
  accent: string;
  count: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private championshipSvc = inject(ChampionshipService);
  private gameSvc = inject(GameService);
  private refereeSvc = inject(RefereeService);
  private teamSvc = inject(TeamService);
  private reportSvc = inject(ReportService);

  user = this.auth.getUser();
  loading = true;

  readonly ArrowRightIcon = ArrowRight;
  readonly TrendingUpIcon = TrendingUp;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly today = new Date();

  stats: StatCard[] = [];
  recentGames: any[] = [];
  pendingReports: any[] = [];

  cards: NavCard[] = [
    {
      path: '/championships',
      label: 'Campeonatos',
      description: 'Gerencie os campeonatos',
      icon: Trophy,
      accent: 'amber',
      count: null,
    },
    {
      path: '/games',
      label: 'Partidas',
      description: 'Jogos e placares',
      icon: Swords,
      accent: 'emerald',
      count: null,
    },
    {
      path: '/referees',
      label: 'Árbitros',
      description: 'Árbitros ativos e suspensos',
      icon: ShieldCheck,
      accent: 'blue',
      count: null,
    },
    {
      path: '/teams',
      label: 'Times',
      description: 'Times participantes',
      icon: Users2,
      accent: 'purple',
      count: null,
    },
    {
      path: '/reports',
      label: 'Denúncias',
      description: 'Denúncias abertas e analisadas',
      icon: FileWarning,
      accent: 'rose',
      count: null,
    },
    ...(this.user?.role === 'ROLE_ADMIN'
      ? [
          {
            path: '/users',
            label: 'Usuários',
            description: 'Gerenciamento de contas',
            icon: Users,
            accent: 'cyan',
            count: null,
          } as NavCard,
        ]
      : []),
  ];

  ngOnInit(): void {
    forkJoin({
      championships: this.championshipSvc.getAll().pipe(catchError(() => of([]))),
      games: this.gameSvc.getAll().pipe(catchError(() => of([]))),
      referees: this.refereeSvc.getAll().pipe(catchError(() => of([]))),
      teams: this.teamSvc.getAll().pipe(catchError(() => of([]))),
      reports: this.reportSvc.getAll().pipe(catchError(() => of([]))),
    }).subscribe((res: any) => {
      this.cards[0].count = res.championships.length;
      this.cards[1].count = res.games.length;
      this.cards[2].count = res.referees.length;
      this.cards[3].count = res.teams.length;
      this.cards[4].count = res.reports.length;

      const activeReferees = res.referees.filter((r: any) => r.status === 'ACTIVE').length;
      const pendingReports = res.reports.filter((r: any) => r.status === 'NEW').length;

      this.stats = [
        {
          label: 'Campeonatos',
          count: res.championships.length,
          icon: Trophy,
          accent: 'amber',
          path: '/championships',
        },
        {
          label: 'Partidas',
          count: res.games.length,
          icon: Swords,
          accent: 'emerald',
          path: '/games',
        },
        {
          label: 'Árbitros Ativos',
          count: activeReferees,
          icon: ShieldCheck,
          accent: 'blue',
          path: '/referees',
        },
        { label: 'Times', count: res.teams.length, icon: Users2, accent: 'purple', path: '/teams' },
        {
          label: 'Denúncias Abertas',
          count: pendingReports,
          icon: FileWarning,
          accent: 'rose',
          path: '/reports',
        },
      ];

      this.recentGames = [...res.games]
        .sort((a: any, b: any) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
        .slice(0, 4);

      this.pendingReports = res.reports
        .filter((r: any) => r.status === 'NEW' || r.status === 'UNDER_REVIEW')
        .slice(0, 4);

      this.loading = false;
    });
  }

  accentClasses(accent: string) {
    const map: Record<string, { icon: string; badge: string; border: string; glow: string }> = {
      amber: {
        icon: 'text-amber-400',
        badge: 'bg-amber-400/10 text-amber-400',
        border: 'hover:border-amber-500/30',
        glow: 'bg-amber-400/10',
      },
      emerald: {
        icon: 'text-emerald-400',
        badge: 'bg-emerald-400/10 text-emerald-400',
        border: 'hover:border-emerald-500/30',
        glow: 'bg-emerald-400/10',
      },
      blue: {
        icon: 'text-blue-400',
        badge: 'bg-blue-400/10 text-blue-400',
        border: 'hover:border-blue-500/30',
        glow: 'bg-blue-400/10',
      },
      purple: {
        icon: 'text-purple-400',
        badge: 'bg-purple-400/10 text-purple-400',
        border: 'hover:border-purple-500/30',
        glow: 'bg-purple-400/10',
      },
      rose: {
        icon: 'text-rose-400',
        badge: 'bg-rose-400/10 text-rose-400',
        border: 'hover:border-rose-500/30',
        glow: 'bg-rose-400/10',
      },
      cyan: {
        icon: 'text-cyan-400',
        badge: 'bg-cyan-400/10 text-cyan-400',
        border: 'hover:border-cyan-500/30',
        glow: 'bg-cyan-400/10',
      },
    };
    return map[accent] ?? map['blue'];
  }

  reportStatusStyle(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-blue-400/10 text-blue-400',
      UNDER_REVIEW: 'bg-amber-400/10 text-amber-400',
      RESOLVED: 'bg-emerald-400/10 text-emerald-400',
    };
    return map[status] ?? 'bg-white/8 text-white/40';
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }
}
