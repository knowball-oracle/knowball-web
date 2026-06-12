import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ArrowLeft, Camera, Save } from '../../../shared/icons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './update-profile.component.html',
})
export class UpdateProfileComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  auth = inject(AuthService);

  user = this.auth.getUser();
  previewPhoto: string | null = null;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CameraIcon = Camera;
  readonly SaveIcon = Save;

  form = this.fb.group({
    name: [this.user?.name ?? '', [Validators.required, Validators.minLength(3)]],
  });

  initials(): string {
    return (
      this.user?.name
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
      this.previewPhoto = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    // TODO: chamar o UserService.updateProfile() quando o endpoint estiver pronto
    const updatedUser = { ...this.user, name: this.form.value.name };
    this.auth.saveSession(this.auth.getToken()!, updatedUser);
    this.router.navigate(['/dashboard']);
  }
}
