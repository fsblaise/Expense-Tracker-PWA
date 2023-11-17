import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HeaderComponent } from './shared/components/header/header.component';
import {  Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    standalone: true,
    imports: [IonApp, IonRouterOutlet, HeaderComponent, RouterOutlet]
})
export class AppComponent {
  isColored = false;
  constructor(private router: Router) {}

  onScroll(event: CustomEvent) {
    if (this.router.url === '/' || this.router.url === '/welcome') {
      if (event.detail.scrollTop > 164) {
        this.isColored = true;
      } else {
        this.isColored = false;
      }
    } else {
      if (event.detail.scrollTop > 36) {
        this.isColored = true;
      } else {
        this.isColored = false;
      }
    }
  }
}
