import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileWarning,
  LucideAngularModule,
  QrCode,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-angular';

interface Metric {
  label: string;
  value: string;
  description: string;
  icon: typeof FileWarning;
  accent: string;
}

interface RefereeRanking {
  name: string;
  reports: number;
  percentage: number;
}

interface StatusData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface FlowStep {
  number: string;
  title: string;
  description: string;
  icon: typeof Smartphone;
}

interface AnalyticsGuideline {
  title: string;
  description: string;
  icon: typeof ShieldCheck;
  accent: string;
}

@Component({
  selector: 'app-oracle-apex',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
  ],
  templateUrl: './oracle-apex.component.html',
})
export class OracleApexComponent {
  readonly ArrowRightIcon = ArrowRight;
  readonly BarChartIcon = BarChart3;
  readonly ClipboardCheckIcon = ClipboardCheck;
  readonly DatabaseIcon = Database;
  readonly QrCodeIcon = QrCode;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly TrendingUpIcon = TrendingUp;
  readonly UsersIcon = Users;

  readonly apexDashboardUrl =
    'https://oracleapex.com/ords/r/knowball_iot/knowball/dashboard-knowball';

  readonly qrCodeImageUrl = 'assets/qrcode-oracle-apex.png';

  /*
   * Dados demonstrativos desta página.
   * Não representam uma consulta ao backend ou ao Oracle APEX.
   */
  readonly metrics: Metric[] = [
    {
      label: 'Denúncias registradas',
      value: '49',
      description: 'Exemplo de registros centralizados para análise.',
      icon: FileWarning,
      accent: 'text-blue-400',
    },
    {
      label: 'Análises concluídas',
      value: '31',
      description: 'Exemplo de registros com status resolvido.',
      icon: CheckCircle2,
      accent: 'text-emerald-400',
    },
    {
      label: 'Em análise',
      value: '12',
      description: 'Exemplo de registros em avaliação.',
      icon: Activity,
      accent: 'text-amber-400',
    },
    {
      label: 'Árbitros cadastrados',
      value: '38',
      description: 'Exemplo de profissionais na base da plataforma.',
      icon: Users,
      accent: 'text-violet-400',
    },
  ];

  private readonly refereeExamples = [
    { name: 'Árbitro demonstrativo A', reports: 8 },
    { name: 'Árbitro demonstrativo B', reports: 6 },
    { name: 'Árbitro demonstrativo C', reports: 5 },
    { name: 'Árbitro demonstrativo D', reports: 4 },
    { name: 'Árbitro demonstrativo E', reports: 3 },
  ];

  readonly refereeRanking: RefereeRanking[] =
    this.refereeExamples.map((referee) => {
      const highestCount = Math.max(
        1,
        ...this.refereeExamples.map((item) => item.reports),
      );

      return {
        ...referee,
        percentage: (referee.reports / highestCount) * 100,
      };
    });

  private readonly statusExamples = [
    {
      label: 'Resolvidas',
      value: 31,
      color: 'bg-emerald-400',
    },
    {
      label: 'Em análise',
      value: 12,
      color: 'bg-amber-400',
    },
    {
      label: 'Novas',
      value: 6,
      color: 'bg-blue-400',
    },
  ];

  readonly statusData: StatusData[] =
    this.statusExamples.map((status) => {
      const total = this.statusExamples.reduce(
        (sum, item) => sum + item.value,
        0,
      );

      return {
        ...status,
        percentage: total > 0 ? (status.value / total) * 100 : 0,
      };
    });

  readonly flowSteps: FlowStep[] = [
    {
      number: '01',
      title: 'Registro do relato',
      description:
        'O usuário seleciona a partida e o árbitro escalado, descreve o ocorrido e recebe um protocolo de acompanhamento.',
      icon: Smartphone,
    },
    {
      number: '02',
      title: 'Triagem e análise',
      description:
        'A equipe administradora acompanha a denúncia, atualiza seu status e registra o resultado da análise.',
      icon: ClipboardCheck,
    },
    {
      number: '03',
      title: 'Visão analítica',
      description:
        'O painel Oracle APEX reúne indicadores para apoiar a leitura dos registros e o acompanhamento da operação.',
      icon: BarChart3,
    },
  ];

  readonly analyticsGuidelines: AnalyticsGuideline[] = [
    {
      title: 'Relato não é comprovação',
      description:
        'A quantidade de denúncias indica registros recebidos, não a confirmação de manipulação ou a responsabilidade de uma pessoa.',
      icon: ShieldCheck,
      accent: 'text-emerald-300',
    },
    {
      title: 'Status representa uma etapa',
      description:
        'Uma denúncia resolvida indica que a análise foi concluída. A conclusão deve ser consultada nos detalhes do registro.',
      icon: ClipboardCheck,
      accent: 'text-amber-300',
    },
    {
      title: 'Contexto antes da comparação',
      description:
        'Considere período, categoria, campeonato e quantidade de partidas antes de comparar volumes de denúncias.',
      icon: BarChart3,
      accent: 'text-blue-300',
    },
  ];
}
