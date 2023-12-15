import { User } from './../models/user.model';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, take } from 'rxjs';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  db: IDBDatabase;

  constructor(private auth: AngularFireAuth, private store: AngularFirestore, private network: NetworkService) {
    const request = indexedDB.open('expense-tracker-db', 3);
    request.onerror = (event: any) => {
      console.error('Database error:', event.target.error);
    };

    request.onupgradeneeded = (event: any) => {
      console.log("Can't sync data, when there is no local database!");
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    }
  }

  private async storeDataInIndexedDB(data: any, isOffline = false): Promise<void> {
    const objectStore = this.db.transaction('Users', 'readwrite').objectStore('Users');
    const needSync = isOffline;
    console.log(data.id);
    
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

  async signUp(email: string, password: string, fullName: string) {
    try {
      await this.auth.createUserWithEmailAndPassword(email, password);
      const id = await this.store.collection('Users').ref.doc().id;
      const userObj = {
        id,
        email,
        fullName,
        syncDarkMode: false,
        darkMode: false,
        expensePreferences: {
          currency: 'Ft',
          language: 'hun'
        },
      } as User;
      await this.store.collection('Users').doc(id).set(userObj);
      await this.storeDataInIndexedDB(userObj);
      return userObj;
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return;
    }
  }

  async updateUser(user: User) {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    try {
      if (isOnline === 'online') {
        await this.storeDataInIndexedDB(user);
        console.log('online update user');
        return await this.store.collection('Users').doc(user.id).set(user);
      } else {
        console.log('offline update user');
        // if no internet, it will only store the user in the indexedDB, with sync: true
        await this.storeDataInIndexedDB(user, true);
      }
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return;
    }
  }

  async syncUser(user: User) {
    await this.store.collection('Users').doc(user.id).set(user);
    await this.storeDataInIndexedDB(user); // this will overwrite the current user object, with sync: false version
  }

  async signIn(email: string, password: string) {
    try {
      const user = await this.auth.signInWithEmailAndPassword(email, password);
      return user;
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return;
    }
  }

  async signOut() {
    await this.auth.signOut();
  }

  async getLoggedInUser() {
    return firstValueFrom(this.auth.authState.pipe(take(1)));
  }

  async getLoggedInUserObj() {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    try {
      const id = (await this.getLoggedInUser())?.uid as string;
      if (isOnline === 'online') {
        const user = await firstValueFrom(await this.store.collection('Users').doc(id).valueChanges()) as unknown as User;
        console.log(id);
        console.log(user.id);
        await this.storeDataInIndexedDB(user);
        return user;
      } else {
        const objectStore = this.db.transaction('Users', 'readwrite').objectStore('Users');

        const request = objectStore.get(id);

        return new Promise<any>((resolve, reject) => {
          request.onsuccess = (event: any) => {
            const item = event.target.result;
            if (item) {
              resolve(item.data);
            } else {
              resolve(null);
            }
          };
          request.onerror = (event: any) => {
            console.error('Error getting data from IndexedDB:', event.target.error);
            reject(event.target.error);
          };
        });
      }
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return null;
    }
  }
}