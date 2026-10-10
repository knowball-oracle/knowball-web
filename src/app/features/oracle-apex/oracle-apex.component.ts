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
  Eye,
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

@Component({
  selector: 'app-oracle-apex',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './oracle-apex.component.html',
})
export class OracleApexComponent {
  readonly ActivityIcon = Activity;
  readonly ArrowRightIcon = ArrowRight;
  readonly BarChartIcon = BarChart3;
  readonly ClipboardCheckIcon = ClipboardCheck;
  readonly DatabaseIcon = Database;
  readonly EyeIcon = Eye;
  readonly FileWarningIcon = FileWarning;
  readonly QrCodeIcon = QrCode;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly SmartphoneIcon = Smartphone;
  readonly TrendingUpIcon = TrendingUp;
  readonly UsersIcon = Users;

  readonly metrics: Metric[] = [
    {
      label: 'Denúncias registradas',
      value: '49',
      description: 'Registros centralizados para análise.',
      icon: FileWarning,
      accent: 'text-blue-400',
    },
    {
      label: 'Casos resolvidos',
      value: '31',
      description: 'Análises concluídas pela equipe.',
      icon: CheckCircle2,
      accent: 'text-emerald-400',
    },
    {
      label: 'Em análise',
      value: '12',
      description: 'Casos acompanhados em tempo real.',
      icon: Activity,
      accent: 'text-amber-400',
    },
    {
      label: 'Árbitros monitorados',
      value: '38',
      description: 'Profissionais vinculados às partidas.',
      icon: Users,
      accent: 'text-violet-400',
    },
  ];

  readonly refereeRanking: RefereeRanking[] = [
    { name: 'André Teixeira', reports: 8, percentage: 100 },
    { name: 'Leandro Dantas', reports: 6, percentage: 75 },
    { name: 'Ricardo Alves', reports: 5, percentage: 63 },
    { name: 'Marcos Vinícius', reports: 4, percentage: 50 },
    { name: 'Carlos Henrique', reports: 3, percentage: 38 },
  ];

  readonly statusData: StatusData[] = [
    {
      label: 'Resolvidas',
      value: 31,
      percentage: 63,
      color: 'bg-emerald-400',
    },
    {
      label: 'Em análise',
      value: 12,
      percentage: 25,
      color: 'bg-amber-400',
    },
    {
      label: 'Novas',
      value: 6,
      percentage: 12,
      color: 'bg-blue-400',
    },
  ];

  readonly flowSteps: FlowStep[] = [
    {
      number: '01',
      title: 'Registro seguro',
      description:
        'O usuário seleciona a partida e o árbitro escalado, descreve o ocorrido e recebe um protocolo único.',
      icon: Smartphone,
    },
    {
      number: '02',
      title: 'Triagem e análise',
      description:
        'A equipe administradora acompanha cada denúncia, altera o status e registra o resultado da análise.',
      icon: ClipboardCheck,
    },
    {
      number: '03',
      title: 'Inteligência de dados',
      description:
        'Os dados estruturados alimentam painéis no Oracle APEX, apontando padrões, riscos e indicadores de integridade.',
      icon: BarChart3,
    },
  ];
}
