import { User } from './../models/user.model';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, take } from 'rxjs';
import { NetworkService } from './network.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  db: IDBDatabase;

  constructor(private auth: AngularFireAuth,
              private store: AngularFirestore,
              private network: NetworkService,
              private toastController: ToastController) {     
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

      request.onerror = async (event: any) => {
        await this.showToast("Something went wrong!");
        console.error('Error storing data in IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async signUp(email: string, password: string, fullName: string) {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    if (!isOnline) {
      await this.showToast("You can't sign up, while disconnected from the internet!");
    }
    try {
      const user = await this.auth.createUserWithEmailAndPassword(email, password);
      const userObj = {
        id: user.user?.uid,
        email,
        fullName,
        syncDarkMode: false,
        darkMode: false,
        expensePreferences: {
          currency: 'Ft',
          language: 'hun'
        },
      } as User;
      await this.store.collection('Users').doc(user.user?.uid).set(userObj);
      await this.storeDataInIndexedDB(userObj);
      return userObj;
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        await this.showToast("Email is already in use!");
      } else {
        await this.showToast("Something went wrong!");
        console.log(e);
      }
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
      await this.showToast("Something went wrong!");
      console.log(e);
      return;
    }
  }

  async syncUser(user: User) {
    await this.store.collection('Users').doc(user.id).set(user);
    await this.storeDataInIndexedDB(user); // this will overwrite the current user object, with sync: false version
  }

  async signIn(email: string, password: string) {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    if (!isOnline) {
      await this.showToast("You can't log in, while disconnected from the internet!");
    }
    try {
      const user = await this.auth.signInWithEmailAndPassword(email, password);
      const log = await this.getLoggedInUser();
      console.log(log?.uid);
      return user;
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential') {
        await this.showToast("Incorrect email or password!");
      } else {
        await this.showToast("Something went wrong!");
        console.log(e);
      }
      return;
    }
  }

  async signOut() {
    await this.auth.signOut();
    window.location.reload();
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
          request.onerror = async (event: any) => {
            await this.showToast("Something went wrong!");
            console.error('Error getting data from IndexedDB:', event.target.error);
            reject(event.target.error);
          };
        });
      }
    } catch (e) {
      await this.showToast("Something went wrong!");
      console.log(e);
      return null;
    }
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      cssClass: "custom-toast",
      duration: 2000
    });
    await toast.present();
  }
}