import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ref } from '@angular/fire/storage';
import { firstValueFrom, map } from 'rxjs';
import { Expense } from '../models/expense.model';
import { Transaction } from '../models/transaction.model';
import { arrayUnion } from '@angular/fire/firestore';

const OCR_API = 'https://api.ocr.space/parse/image';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(private http: HttpClient, private fstore: AngularFirestore) { }

  async doOcr(input: ElementRef<HTMLInputElement>) {
    const inputEl = input.nativeElement;
    if (inputEl.files && inputEl.files.length > 0) {
      const file = inputEl.files[0];
      console.log(file);

      const formData: FormData = new FormData();
      formData.append('file', file);
      formData.append('language', 'hun');
      formData.append('IsCreateSearchablePDF', 'false');
      formData.append('isSearchablePdfHideTextLayer', 'false');
      formData.append('isTable', 'true');
      formData.append('OCREngine', '1');

      return firstValueFrom(this.http.post(OCR_API, formData, {
        headers: {
          'apikey': 'K88290015888957'
        }
      }));
    } else {
      return null;
    }
  }

  async getActiveMonths(userId: string) {
    const res = await firstValueFrom(this.fstore.collection('Expenses').doc(userId).valueChanges());

    return res;
  }

  async getExpense(month: string, userId: string) {
    const res = await firstValueFrom(this.fstore
      .collection<Expense>('Expenses', ref => ref
        .where('userId', '==', userId)
        .where('month', '==', month))
      .valueChanges());

    return res[0];
  }

  async addExpense(transaction: Transaction, userId: string) {
    // get current month and year
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const monthStr = year + '-' + month;

    // check if an expense representing the current month is already existing
    const snapshot = await firstValueFrom(this.fstore
      .collection<Expense>('Expenses', ref => ref
        .where('month', '==', monthStr)
        .where('userId', '==', userId))
      .valueChanges()
      .pipe(
        map(docs => docs.length > 0 ? docs[0] : null)
      )
    );

    if(snapshot) {
      const docId = snapshot.id;
      await this.fstore.collection('Expenses').doc(docId).update({
        transactions: arrayUnion(transaction),
      });
    } else {
      const id = await this.fstore.collection('Expenses').ref.doc().id;
      const expense: Expense = {
        id,
        userId,
        month: monthStr,
        guests: [],
        transactions: [transaction],
        summary: {
          spent: transaction.amount,
          storeCount: 1,
          transactionCount: 1
        }
      };
      await this.fstore.collection('Expenses').doc(id).set(expense);
    }

    // return await this.fstore.collection('Expenses')
  }

}
