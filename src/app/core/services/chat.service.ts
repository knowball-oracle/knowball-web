import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private url = `${environment.apiUrl}/chat`;

  constructor(private auth: AuthService) {}

  sendMessage(message: string): Observable<string> {
    const token = this.auth.getToken();

    return new Observable((observer) => {
      fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ message }),
      })
        .then((res) => {
          if (!res.ok || !res.body) {
            observer.error('Erro na conexão com o Kiko');
            return;
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const read = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                observer.complete();
                return;
              }

              buffer += decoder.decode(value, { stream: true });

              const events = buffer.split('\n\n');
              buffer = events.pop() ?? '';

              events.forEach((event) => {
                const lines = event.split('\n').filter((l) => l.startsWith('data:'));
                const text = lines.map((l) => l.slice(5)).join('');
                if (text && text !== '[DONE]') observer.next(text);
              });

              read();
            });
          };
          read();
        })
        .catch((err) => observer.error(err));
    });
  }
}
