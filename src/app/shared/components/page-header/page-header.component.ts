import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() backPath?: string;
  @Input() backLabel = 'Voltar';
  @Input() actionLabel?: string;
  @Input() actionPath?: string;
}
