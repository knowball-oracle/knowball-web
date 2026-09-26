import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { teamAvatarColorClass, teamInitials } from '../../utils/team-avatar.util';

@Component({
  selector: 'app-team-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 min-w-0">
      @if (logoUrl && !imageFailed) {
        <img
          [src]="logoUrl"
          [alt]="'Escudo do ' + (name || 'time')"
          class="shrink-0 rounded-full object-contain border border-white/10 bg-white/5"
          [style.width.px]="size"
          [style.height.px]="size"
          (error)="onImageError()"
        />
      } @else {
        <div
          class="shrink-0 rounded-full border flex items-center justify-center font-bold"
          [class]="colorClass"
          [style.width.px]="size"
          [style.height.px]="size"
          [style.fontSize.px]="size * 0.38"
        >
          {{ initials }}
        </div>
      }

      @if (showName) {
        <span class="truncate" [class]="nameClass">{{ name }}</span>
      }
    </div>
  `,
})
export class TeamBadgeComponent {
  @Input() name: string | undefined | null = '';
  @Input() logoUrl?: string | null;
  @Input() size = 28;
  @Input() showName = true;
  @Input() nameClass = 'text-sm font-medium text-white/80';

  imageFailed = false;

  get initials(): string {
    return teamInitials(this.name);
  }

  get colorClass(): string {
    return teamAvatarColorClass(this.name);
  }

  onImageError(): void {
    this.imageFailed = true;
  }
}
