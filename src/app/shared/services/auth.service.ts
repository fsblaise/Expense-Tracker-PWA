import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private auth: AngularFireAuth, ) { }

  async signUp(email: string, password: string) {
    try {
      const user = await this.auth.createUserWithEmailAndPassword(email, password);
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
      const user = await this.auth.signInWithEmailAndPassword(email, password);
      return user;
    } catch {
      console.log('something went wrong');
      return;
    }
  }

  async signOut() {
    await this.auth.signOut();
  }

  async getLoggedInUser() {
    return firstValueFrom(this.auth.authState.pipe(take(1)));
  }
}