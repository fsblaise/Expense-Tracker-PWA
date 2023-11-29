import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HeaderComponent } from './shared/components/header/header.component';
import {  Router, RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    standalone: true,
    styleUrls: ['./app.component.scss'],
    imports: [
      IonApp,
      IonRouterOutlet,
      HeaderComponent,
      RouterOutlet,
      NavigationComponent,
      CommonModule,
    ]
})
export class AppComponent {
  isColored = false;
  constructor(protected router: Router) {}

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
