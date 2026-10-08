import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    document.documentElement.removeAttribute('data-theme');
  }

  isDark(): boolean {
    return true;
  }
}
