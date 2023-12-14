import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, take } from 'rxjs';
import { NetworkService } from './network.service';
import { ExpenseService } from './expense.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  db: IDBDatabase;
  previousNetworkState: 'online' | 'offline' = 'online';

  constructor(private expenseService: ExpenseService, private toastController: ToastController, private network: NetworkService) { 
    const request = indexedDB.open('expense-tracker-db', 2);
    request.onerror = (event: any) => {
      console.error('Database error:', event.target.error);
    };

    request.onupgradeneeded = (event: any) => {
      console.log("Can't sync data, when there is no local database!");
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    }

    this.network.getNetworkState().subscribe((state) => {
      if (this.previousNetworkState === 'offline' && state === 'online') {
        this.sync();
        console.log('asd');
      }
      this.previousNetworkState = state;
    });
  }

  async sync(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'You are now online! Synchronizing data.',
      icon: 'sync-outline',
      cssClass: "custom-toast",
    });
    await toast.present();
    setTimeout(async () => {await toast.dismiss()}, 40000);
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        console.log("Can't sync data, when there is no local database!");
        resolve();
        await toast.dismiss();
        return;
      }
      const request = this.db.transaction('Expenses', 'readonly').objectStore('Expenses').openCursor();
      request.onsuccess = async (event: any) => {
        const cursor = event.target.result;
    
        if (cursor) {
          const item = cursor.value;
    
          if (item && item.needSync) {
            try {
              console.log('Synchronizing item:', item);
              // call merge function
              // this function also calls a fn that removes the item, since it will replace it with the new firebase data
              await this.expenseService.mergeExpenses(item.data);
            } catch (e) {
              console.error('Error during synchronization:', e);
              reject(e);
              await toast.dismiss();
              return;
            }
          }
          // Move to the next item
          cursor.continue();
        } else {
          // No more items
          resolve();
          await toast.dismiss();
        }
      };
    
      request.onerror = async (event: any) => {
        console.error('Error iterating through IndexedDB:', event.target.error);
        reject(event.target.error);
        await toast.dismiss();
      };
      // TODO: Go through every expense, and check for the syncNeeded flag.
      
      //       When the app is offline, every insert (addExpense) should be marked with the syncNeeded flag
      //       Once the app is online, call this method.
    });
  }

  updateItem(item: any) {
    return new Promise<void>((resolve, reject) => {
      const objectStore = this.db.transaction('Expenses', 'readwrite').objectStore('Expenses');
      const request = objectStore.put(item);
  
      request.onsuccess = () => {
        resolve();
      };
  
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }
}