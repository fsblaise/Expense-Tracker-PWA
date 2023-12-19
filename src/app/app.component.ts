import { Component, HostListener, OnInit } from '@angular/core';
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
import { Meta } from '@angular/platform-browser';


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
  small = false;

  constructor(protected router: Router,
              private swUpdate: SwUpdate,
              private idbService: IDBService,
              private network: NetworkService,
              private syncService: SyncService,
              private toastController: ToastController,
              private meta: Meta) { }

  ngOnInit(): void {
    this.onResize('');
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.initializeDarkTheme(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkTheme(mediaQuery.matches));

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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 576) {
      this.small = true;
    } else {
      this.small = false;
    }
  }

  onScroll(event: CustomEvent) {
    if (this.router.url === '/' || this.router.url === '/welcome') {
      if (event.detail.scrollTop > 164) {
        this.meta.updateTag({name: 'theme-color', content: '#d2e8d3'});

        this.isColored = true;
      } else {
        this.meta.updateTag({name: 'theme-color', content: '#fbfdf7'});
        
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

  initializeDarkTheme(isDark: boolean) {
    this.toggleDarkTheme(isDark);
  }

  toggleChange(ev: any) {
    this.toggleDarkTheme(ev.detail.checked);
  }

  toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  ngOnDestroy(): void {
    // Erőforrások felszabadítása
    this.subscription.unsubscribe();
  }
}
