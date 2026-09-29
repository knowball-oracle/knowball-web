import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { teamAvatarColorClass, teamInitials } from '../../utils/team-avatar.util';

@Component({
  selector: 'app-team-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-w-0 items-center gap-2">
      @if (logoUrl && !imageFailed) {
        <span
          class="flex shrink-0 items-center justify-center"
          [style.width.px]="size"
          [style.height.px]="size"
        >
          <img
            [src]="logoUrl"
            [alt]="'Escudo do ' + (name || 'time')"
            class="block h-full w-full object-contain"
            (error)="onImageError()"
          />
        </span>
      } @else {
        <div
          class="flex shrink-0 items-center justify-center rounded-full border font-bold"
          [class]="colorClass"
          [style.width.px]="size"
          [style.height.px]="size"
          [style.fontSize.px]="size * 0.38"
          [attr.aria-label]="'Sem escudo: ' + (name || 'time')"
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
