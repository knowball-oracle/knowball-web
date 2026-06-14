import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  computed,
  inject,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

@Component({
  selector: 'app-kiko-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kiko-chat.component.html',
})
export class KikoChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesEl!: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  input = signal('');
  loading = signal(false);
  private shouldScroll = false;

  isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly SUGGESTIONS = [
    'O que é o Knowball?',
    'Como faço uma denúncia?',
    'O que é um protocolo KB?',
  ];

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen() && this.messages().length === 0) {
      this.addWelcome();
    }
  }

  private addWelcome(): void {
    this.messages.set([
      {
        role: 'assistant',
        content:
          'Olá! 👋 Sou o **Kiko**, seu guia no Knowball. Posso te ajudar a entender o sistema e a realizar denúncias. Como posso te ajudar hoje?',
      },
    ]);
  }

  sendSuggestion(text: string): void {
    this.input.set(text);
    this.send();
  }

  send(): void {
    const text = this.input().trim();
    if (!text || this.loading()) return;

    this.messages.update((m) => [...m, { role: 'user', content: text }]);
    this.input.set('');
    this.loading.set(true);
    this.shouldScroll = true;

    const assistantIndex = this.messages().length;
    this.messages.update((m) => [...m, { role: 'assistant', content: '', streaming: true }]);

    this.chatService.sendMessage(text).subscribe({
      next: (chunk) => {
        this.messages.update((m) => {
          const updated = [...m];
          updated[assistantIndex] = {
            ...updated[assistantIndex],
            content: updated[assistantIndex].content + chunk,
          };
          return updated;
        });
        this.shouldScroll = true;
      },
      complete: () => {
        this.messages.update((m) => {
          const updated = [...m];
          updated[assistantIndex] = { ...updated[assistantIndex], streaming: false };
          return updated;
        });
        this.loading.set(false);
      },
      error: () => {
        this.messages.update((m) => {
          const updated = [...m];
          updated[assistantIndex] = {
            role: 'assistant',
            content: 'Desculpe, estou com dificuldades agora. Tente novamente em instantes. 🙏',
            streaming: false,
          };
          return updated;
        });
        this.loading.set(false);
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messagesEl) {
      const el = this.messagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}
