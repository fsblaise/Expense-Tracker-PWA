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

  constructor(private auth: AngularFireAuth, private store: AngularFirestore, private network: NetworkService) { }

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
      return userObj;
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return;
    }
  }

  async updateUser(user: User) {
    try {
      return await this.store.collection('Users').doc(user.id).set(user);
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return;
    }
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
    try {
      const id = (await this.getLoggedInUser())?.uid;
      return firstValueFrom(await this.store.collection('Users').doc(id).valueChanges()) as unknown as User;
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return null;
    }
  }
}