import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CircleCheck, Copy, Mail } from '../../icons/icons';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './ticket-modal.component.html',
})
export class TicketModalComponent {
  @Input() visible = false;
  @Input() protocolo = '';
  @Input() email = '';

  @Output() closed = new EventEmitter<void>();

  readonly CircleCheck = CircleCheck;
  readonly Copy = Copy;
  readonly Mail = Mail;

  copied = false;

  close(): void {
    this.closed.emit();
  }

  copiar(): void {
    navigator.clipboard.writeText(this.protocolo).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
