import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, ToastController } from '@ionic/angular/standalone';
import { HeaderComponent } from './shared/components/header/header.component';
import {  Router, RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { NetworkService } from './shared/services/network.service';


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
export class AppComponent implements OnInit {
  isColored = false;

  constructor(protected router: Router,
              private swUpdate: SwUpdate,
              private network: NetworkService,
              private toastController: ToastController) {
    
  }

  ngOnInit(): void { }

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
