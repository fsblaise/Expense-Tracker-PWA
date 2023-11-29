import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import * as fbAuth from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private auth: Auth) { }

  async signUp(email: string, password: string) {
    try {
      const user = await fbAuth.createUserWithEmailAndPassword(this.auth ,email, password);
      console.log(user);
      return user;
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
      return;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const user = await fbAuth.signInWithEmailAndPassword(this.auth ,email, password);
      return user;
    } catch {
      console.log('something went wrong');
      return;
    }
  }
}