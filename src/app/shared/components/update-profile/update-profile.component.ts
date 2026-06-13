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
    this._compressImage(file, 400, 0.75).then((base64) => {
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
    });
  }

  private _compressImage(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;

          if (w > h && w > maxSize) {
            h = (h * maxSize) / w;
            w = maxSize;
          } else if (h > maxSize) {
            w = (w * maxSize) / h;
            h = maxSize;
          }

          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  goBack(): void {
    this.location.back();
  }
}
