import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root',
})
export class IDBService {
  db: IDBDatabase;

  constructor() {
    const request = indexedDB.open('expense-tracker-db', 3);
    request.onerror = (event: any) => {
      console.error('Database error:', event.target.error);
    };

    request.onupgradeneeded = (event: any) => {
      console.log('asd')
      this.db = event.target.result;
      this.db.createObjectStore('Users', {
        keyPath: 'id',
      });
      const expenseObjectStore = this.db.createObjectStore('Expenses', {
        keyPath: 'id',
      });
      expenseObjectStore.createIndex('userId_month', ['data.userId', 'data.month']);
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    }
  }

  // TODO: move idb methods from expense and auth here
  private async storeDataInIndexedDB(storeName: string, data: any, isOffline = false): Promise<void> {
    const objectStore = this.db.transaction(storeName, 'readwrite').objectStore(storeName);
    const needSync = isOffline;
    const request = objectStore.put({ id: data.id, data, needSync });

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        console.error('Error storing data in IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  private async removeItemFromIndexedDB(storeName: string, key: string): Promise<void> {
    const objectStore = this.db.transaction(storeName, 'readwrite').objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

}