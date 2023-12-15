import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, ToastController } from '@ionic/angular/standalone';
import { HeaderComponent } from './shared/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { NetworkService } from './shared/services/network.service';
import { SyncService } from './shared/services/sync.service';
import { Subscription, interval } from 'rxjs';
import { IDBService } from './shared/services/idb.service';


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
  subscription: Subscription;
  db: IDBDatabase;

  constructor(protected router: Router,
              private swUpdate: SwUpdate,
              private idbService: IDBService,
              private network: NetworkService,
              private syncService: SyncService,
              private toastController: ToastController) { }

  ngOnInit(): void {
    // Manifest állományok összevetése 3 másodpercenként
    this.subscription = interval(3000).subscribe(() => {

      // Összehasonlítja a szerver-kliens manifest fájlokat
      this.swUpdate.checkForUpdate().then(update => {

        /*
         Ha történt módosítás (új alkalmazás verzió érhető el),
         újratölti az alkalmazást és betölti az új/módosított fájlokat
        */
        if (update) {
          alert('New version is available, refresh the application!');
          window.location.reload();
        }
      })
    })

  }

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

  ngOnDestroy(): void {
    // Erőforrások felszabadítása
    this.subscription.unsubscribe();
  }
}
