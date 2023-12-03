import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ref } from '@angular/fire/storage';
import { firstValueFrom } from 'rxjs';
import { Expense } from '../models/expense.model';

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

}
