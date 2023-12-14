import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {

  private networkState = new BehaviorSubject<'online' | 'offline'>('online');

  constructor(private toastController: ToastController) {
    window.addEventListener("offline", async () => {
      this.updateNetworkState('offline');
      const toast = await this.toastController.create({
        message: 'No internet connection! Using local data.',
        cssClass: "custom-toast",
        duration: 1500,
      });
    
      await toast.present();
    });

    window.addEventListener("online", async () => {
      this.updateNetworkState('online');
      const toast = await this.toastController.create({
        message: 'You are now online! Using database.',
        cssClass: "custom-toast",
        duration: 1500,
      });
    
      await toast.present();
    });
   }

  updateNetworkState(state: 'online' | 'offline') {
    this.networkState.next(state);
  }

  getNetworkState() {
    return this.networkState.asObservable();
  }
}