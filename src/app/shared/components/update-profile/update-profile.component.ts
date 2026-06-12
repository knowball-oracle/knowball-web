import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ArrowLeft, Camera } from '../../../shared/icons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../features/user/services/user.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './update-profile.component.html',
})
export class UpdateProfileComponent {
  private location = inject(Location);
  private userService = inject(UserService);
  auth = inject(AuthService);

  user = this.auth.user;
  photo = this.auth.photo;
  uploading = false;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CameraIcon = Camera;

  initials(): string {
    return (
      this.user()
        ?.name?.split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() ?? '?'
    );
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;

      this.userService.updateMyProfile({ profilePicture: base64 }).subscribe({
        next: () => {
          this.auth.savePhoto(base64);
          this.uploading = false;
        },
        error: () => {
          this.auth.savePhoto(base64);
          this.uploading = false;
        },
      });
    };
    reader.readAsDataURL(file);
  }

  goBack(): void {
    this.location.back();
  }
}
