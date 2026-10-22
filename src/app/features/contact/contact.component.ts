import { CommonModule } from '@angular/common';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly instagramUrl = 'https://www.instagram.com/_knowball/';
  readonly instagramHandle = '@_knowball';

  readonly contactEmail = 'systemknowball@gmail.com';

  readonly contactEmailUrl =
    'mailto:systemknowball@gmail.com?subject=' + encodeURIComponent('Contato pelo site Knowball');

  readonly postDate = 'Hoje';
}
