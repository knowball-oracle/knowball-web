import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Plus } from '../../shared/icons/icons';
import { AuthService } from '../../core/services/auth.service';

type FaqTopic = 'Geral' | 'Denúncias' | 'Privacidade';

interface FaqItem {
  id: number;
  topic: FaqTopic;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './faq.component.html',
})
export class FaqComponent {
  auth = inject(AuthService);

  readonly PlusIcon = Plus;
  readonly topics: FaqTopic[] = ['Geral', 'Denúncias', 'Privacidade'];

  readonly items: FaqItem[] = [
    {
      id: 1,
      topic: 'Geral',
      question: 'O Knowball é pago?',
      answer:
        'Não. O Knowball é totalmente gratuito. Não há mensalidade, taxa de cadastro nem cobrança para registrar ou acompanhar denúncias.',
    },
    {
      id: 2,
      topic: 'Geral',
      question: 'O que é o Knowball?',
      answer:
        'É um sistema de denúncias voltado a suspeitas de manipulação e irregularidades em jogos das categorias de base do futebol brasileiro masculino. Ele centraliza o registro, a análise e o acompanhamento de cada caso.',
    },
    {
      id: 3,
      topic: 'Geral',
      question: 'Quais categorias são atendidas?',
      answer:
        'O Knowball cobre partidas das categorias de base masculinas: Sub-13, Sub-15, Sub-17 e Sub-20.',
    },
    {
      id: 4,
      topic: 'Geral',
      question: 'Preciso criar uma conta para usar?',
      answer:
        'Sim. Para registrar e acompanhar denúncias você precisa de uma conta, e o seu e-mail é confirmado por um código de verificação. Isso garante que o protocolo e as atualizações cheguem até você.',
    },
    {
      id: 5,
      topic: 'Denúncias',
      question: 'Como faço uma denúncia?',
      answer:
        'Acesse Denúncias e clique em Nova. Escolha a partida, selecione o árbitro escalado e descreva o ocorrido com pelo menos 20 caracteres. Ao enviar, você recebe um protocolo.',
    },
    {
      id: 6,
      topic: 'Denúncias',
      question: 'Posso denunciar qualquer árbitro?',
      answer:
        'Não. Só é possível denunciar um árbitro que estava escalado na partida selecionada. Se a arbitragem ainda não aparece na partida, ela precisa ser vinculada antes de a denúncia ser enviada.',
    },
    {
      id: 7,
      topic: 'Denúncias',
      question: 'O que é o protocolo?',
      answer:
        'É um código único, no formato KB-AAAA-NNN (por exemplo, KB-2026-001), gerado quando a denúncia é enviada. Ele identifica o seu caso e também chega por e-mail.',
    },
    {
      id: 8,
      topic: 'Denúncias',
      question: 'Quais são os status de uma denúncia?',
      answer:
        'Nova: a denúncia foi recebida e aguarda análise. Em análise: a nossa equipe está avaliando o relato. Resolvida: a análise foi concluída.',
    },
    {
      id: 9,
      topic: 'Denúncias',
      question: 'Serei avisado sobre o andamento?',
      answer:
        'Sim. Você recebe um e-mail ao registrar a denúncia, quando ela entra em análise e quando é resolvida. No e-mail de resolução vem o sentimento do relato (Positivo, Neutro ou Negativo), com uma breve explicação.',
    },
    {
      id: 10,
      topic: 'Denúncias',
      question: 'Quanto tempo leva a análise?',
      answer:
        'Não há um prazo fixo, porque cada caso tem a sua complexidade. Você é avisado por e-mail a cada mudança de status e pode consultar o andamento a qualquer momento em Denúncias.',
    },
    {
      id: 11,
      topic: 'Privacidade',
      question: 'Minhas informações estão seguras?',
      answer:
        'Sim. Seus dados e o relato são protegidos e utilizados exclusivamente para a análise da denúncia.',
    },
    {
      id: 12,
      topic: 'Privacidade',
      question: 'Outros usuários conseguem ver o meu relato?',
      answer:
        'Não. Usuários comuns visualizam apenas as próprias denúncias. O acesso aos relatos para análise é restrito à equipe administradora.',
    },
  ];

  readonly selectedTopic = signal<FaqTopic | null>(null);
  readonly openId = signal<number | null>(null);

  readonly filteredItems = computed(() => {
    const topic = this.selectedTopic();
    return topic ? this.items.filter((item) => item.topic === topic) : this.items;
  });

  toggle(id: number): void {
    this.openId.update((current) => (current === id ? null : id));
  }

  isOpen(id: number): boolean {
    return this.openId() === id;
  }

  selectTopic(topic: FaqTopic | null): void {
    this.selectedTopic.set(topic);
    this.openId.set(null);
  }

  countByTopic(topic: FaqTopic): number {
    return this.items.filter((item) => item.topic === topic).length;
  }
}
