import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-main-layout>
      <router-outlet></router-outlet>
    </app-main-layout>
  `,
  styles: []
})
export class AppComponent {
  title = 'Qota Finance';
}
