import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ref } from '@angular/fire/storage';
import { firstValueFrom, map } from 'rxjs';
import { Expense } from '../models/expense.model';
import { Transaction } from '../models/transaction.model';
import { arrayUnion } from '@angular/fire/firestore';
import { NetworkService } from './network.service';

const OCR_API = 'https://api.ocr.space/parse/image';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  db: IDBDatabase;

  constructor(private http: HttpClient, private fstore: AngularFirestore, private network: NetworkService) {
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
    const objectStore = this.db.transaction('Expenses', 'readwrite').objectStore('Expenses');
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

  private async removeItemFromIndexedDB(key: string): Promise<void> {
    const objectStore = this.db.transaction('Expenses', 'readwrite').objectStore('Expenses');

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

  async getActiveMonths(userId: string): Promise<any> {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    if (isOnline === 'online') {
      console.log('getExpense online');
      console.log(userId);
      const res = await firstValueFrom(this.fstore.collection('Expenses').doc(userId).valueChanges());
      if (res) {
        await this.storeDataInIndexedDB(res);
      }
      return res;
    } else {
      console.log(isOnline);
      console.log('getExpense offline');
      console.log(userId);
      const objectStore = this.db.transaction('Expenses', 'readwrite').objectStore('Expenses');

      const request = objectStore.get(userId);

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
  }

  async getExpense(month: string, userId: string): Promise<Expense> {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    if (isOnline === 'online') {
      console.log('getExpense online');
      const res = await firstValueFrom(this.fstore
        .collection<Expense>('Expenses', ref => ref
          .where('userId', '==', userId)
          .where('month', '==', month))
        .valueChanges());

      await this.storeDataInIndexedDB(res[0]);

      return res[0];
    } else {
      console.log('getExpense offline');
      const objectStore = this.db.transaction('Expenses', 'readwrite').objectStore('Expenses');
      const results: Expense[] = [];
      const index = objectStore.index('userId_month');
      const request = index.openCursor(IDBKeyRange.only([userId, month]));

      return new Promise<Expense>((resolve, reject) => {
        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            const item = cursor.value;
            if (item.data.userId === userId && item.data.month === month) {
              results.push(item.data);
            }
            cursor.continue();
          } else {
            console.log(results);
            resolve(results[0]);
          }
        };
        request.onerror = (event: any) => {
          console.error('Error getting data from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      })
    }
  }

  private async getExpenseSnapshot(month: string, userId: string): Promise<Expense | null> {
    return await firstValueFrom(this.fstore
      .collection<Expense>('Expenses', ref => ref
        .where('month', '==', month)
        .where('userId', '==', userId))
      .valueChanges()
      .pipe(
        map(docs => docs.length > 0 ? docs[0] : null)
      )
    );
  }

  async addExpense(storeName: string, amount: number, userId: string): Promise<void> {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const monthStr = year + '-' + month;

    const transaction: Transaction = {
      id: await this.fstore.collection('Expenses').ref.doc().id,
      storeName,
      amount,
      timestamp: new Date().toISOString()
    }

    const isOnline = await firstValueFrom(this.network.getNetworkState());
    if (isOnline === 'online') {
      const snapshot = await this.getExpenseSnapshot(monthStr, userId);

      if (snapshot) {
        const docId = snapshot.id;

        snapshot.summary.spent += amount;
        snapshot.summary.transactionCount++;
        if (snapshot.transactions.filter(item => item.storeName === storeName).length === 0) {
          snapshot.summary.storeCount++;
        }
        snapshot.transactions.push(transaction)

        await this.fstore.collection('Expenses').doc(docId).update({
          transactions: arrayUnion(transaction),
          summary: {
            spent: snapshot.summary.spent,
            storeCount: snapshot.summary.storeCount,
            transactionCount: snapshot.summary.transactionCount
          },
        });
        await this.storeDataInIndexedDB(snapshot);
      } else {
        const id = await this.fstore.collection('Expenses').ref.doc().id;

        const expense: Expense = {
          id,
          userId,
          month: monthStr,
          guests: [],
          transactions: [transaction],
          summary: {
            spent: amount,
            storeCount: 1,
            transactionCount: 1
          }
        };

        const expenseRef = this.fstore.collection('Expenses').doc(id);
        const activeMonthsRef = this.fstore.collection('Expenses').doc(userId);
        try {
          await this.fstore.firestore.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(activeMonthsRef.ref);

            if (snapshot.exists) {
              transaction.update(activeMonthsRef.ref, {
                activeMonths: arrayUnion(monthStr),
              });
            } else {
              transaction.set(activeMonthsRef.ref, {
                id: userId,
                activeMonths: [monthStr],
              });
            }

            transaction.set(expenseRef.ref, expense);
          });
        } catch (e) {
          console.log(e);
        }

        await this.storeDataInIndexedDB(expense);
      }
    } else {
      const activeMonthsObj = await this.getActiveMonths(userId);

      // ha van mar activeMonths
      if (activeMonthsObj) {
        const activeMonths: string[] = activeMonthsObj.activeMonths;
        // ha nincs meg ilyen honap, adjuk hozza
        if (!activeMonths.includes(monthStr)) {
          activeMonths.push(monthStr);
          // hozzaadjuk ujra a lokalhoz, azaz felulirjuk az elozot, hogy syncelodjon
          await this.storeDataInIndexedDB(activeMonthsObj, true);
        }
      } else {
        // ha meg nincs activeMonths, hozza kell adni
        const activeMonthsObj = {
          id: userId,
          activeMonths: [monthStr]
        }
        // flageljuk a synchez
        await this.storeDataInIndexedDB(activeMonthsObj, true);
      }

      const expenseObj = await this.getExpense(monthStr, userId);

      if (expenseObj) {
        expenseObj.summary.spent += amount;
        expenseObj.summary.transactionCount++;
        if (expenseObj.transactions.filter(item => item.storeName === storeName).length === 0) {
          expenseObj.summary.storeCount++;
        }
        expenseObj.transactions.push(transaction);
        await this.storeDataInIndexedDB(expenseObj, true);
      } else {
        const id = await this.fstore.collection('Expenses').ref.doc().id;
        const expense: Expense = {
          id,
          userId,
          month: monthStr,
          guests: [],
          transactions: [transaction],
          summary: {
            spent: amount,
            storeCount: 1,
            transactionCount: 1
          }
        };
        await this.storeDataInIndexedDB(expense, true);
      }
    }
  }

  async mergeExpenses(expense: Expense): Promise<void> {
    const snapshot = await this.getExpenseSnapshot(expense.month, expense.userId);

    if (snapshot) {
      const docId = snapshot.id;

      snapshot.summary.spent += expense.summary.spent;
      snapshot.summary.transactionCount += expense.summary.transactionCount;
      for (let transaction of expense.transactions) {
        if (snapshot.transactions.filter(item => item.storeName === transaction.storeName).length === 0) {
          snapshot.summary.storeCount++;
        }
        snapshot.transactions.push(transaction);
      }

      await this.fstore.collection('Expenses').doc(docId).update({
        transactions: snapshot.transactions,
        summary: {
          spent: snapshot.summary.spent,
          storeCount: snapshot.summary.storeCount,
          transactionCount: snapshot.summary.transactionCount
        },
      });
      // delete the current expense from IDB
      // it's necessary since, the stored data has a different id, because of the merge.
      await this.removeItemFromIndexedDB(expense.id);
      await this.storeDataInIndexedDB(snapshot);
    } else {
      // upload the new month's expense and update the activeMonths
      await this.fstore.collection('Expenses').doc(expense.id).set(expense);
      await this.fstore.collection('Expenses').doc(expense.userId).update({
        activeMonths: arrayUnion(expense.month),
      });
      await this.removeItemFromIndexedDB(expense.id);
      await this.storeDataInIndexedDB(expense);
    }
  }

  async mergeActiveMonths(data: any) {
    const activeMonthsRef = this.fstore.collection('Expenses').doc(data.id);
    try {
      await this.fstore.firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(activeMonthsRef.ref);

        if (snapshot.exists) {
          transaction.update(activeMonthsRef.ref, {
            activeMonths: arrayUnion(data.activeMonths),
          });

        } else {
          transaction.set(activeMonthsRef.ref, {
            id: data.id,
            activeMonths: data.activeMonths,
          });
        }
      }).then(async () => {
        await this.removeItemFromIndexedDB(data.id);
        const activeMonthsObj = await this.getActiveMonths(data.id);
        await this.storeDataInIndexedDB(activeMonthsObj);
      });
    } catch (e) {
      console.log(e);
    }
  }

  async addGuest() {
    const isOnline = await firstValueFrom(this.network.getNetworkState());
    if (isOnline === 'online') {

    }
  }

  async doOcr(input: ElementRef<HTMLInputElement>, lang: string): Promise<Object | null> {
    const inputEl = input.nativeElement;
    if (inputEl.files && inputEl.files.length > 0) {
      const file = inputEl.files[0];
      console.log(file);

      const formData: FormData = new FormData();
      formData.append('file', file);
      formData.append('language', lang);
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
}
