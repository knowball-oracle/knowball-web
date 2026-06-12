import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ArrowLeft, Camera } from '../../../shared/icons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './update-profile.component.html',
})
export class UpdateProfileComponent {
  private location = inject(Location);
  auth = inject(AuthService);

  user = this.auth.user;
  photo = this.auth.photo;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CameraIcon = Camera;

  initials(): string {
    return (
      this.user()?.name
        ?.split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() ?? '?'
    );
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.auth.savePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  goBack(): void {
    this.location.back();
  }
}
