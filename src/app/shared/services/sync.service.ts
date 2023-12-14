import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, take } from 'rxjs';
import { NetworkService } from './network.service';
import { ExpenseService } from './expense.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private network: NetworkService, private expenseService: ExpenseService) { }

  sync() {
    // TODO: Go through every expense, and check for the syncNeeded flag.
    
    //       When the app is offline, every insert (addExpense) should be marked with the syncNeeded flag
    //       Once the app is online, call this method.
  }
}