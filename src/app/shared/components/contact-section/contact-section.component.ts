import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  templateUrl: './contact-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSectionComponent {
  readonly instagramUrl = 'https://www.instagram.com/_knowball/';

  readonly instagramHandle = '@_knowball';

  readonly contactEmail = 'systemknowball@gmail.com';

  readonly contactEmailUrl =
    'mailto:systemknowball@gmail.com?subject=' + encodeURIComponent('Contato pelo site Knowball');
}
