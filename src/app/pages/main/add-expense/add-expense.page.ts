import { Transaction } from './../../../shared/models/transaction.model';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PSM, createWorker } from 'tesseract.js';
// @ts-ignore
import preprocessImage from './preprocess';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { ExpenseService } from 'src/app/shared/services/expense.service';
import { getAddExpenseForm } from 'src/app/shared/forms/add-expense.form';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user.model';
import { NetworkService } from 'src/app/shared/services/network.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({ height: '*' })),
      state('false', style({ height: '0px' })),
      transition('false <=> true', [animate(300)])
    ])
  ],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, DialogComponent, ReactiveFormsModule]
})
export class AddExpensePage implements OnInit, OnDestroy {
  user: firebase.default.User | null;
  workerPromise: Promise<Tesseract.Worker>;
  worker: Tesseract.Worker;
  @ViewChild('canvas') canvasRef!: ElementRef;
  @ViewChild('image') imageRef!: ElementRef;
  percentage = 0;
  isRecognising = false;
  initializing = false;
  processing = false;
  accordionOpened = false;
  showAlert = false;
  processedText: string;
  selectedFile: File | null = null;
  userObj: User;

  addExpenseForm: FormGroup = getAddExpenseForm();


  constructor(private expenseService: ExpenseService, private authService: AuthService, private networkService: NetworkService) {
    this.workerPromise = this.initTesseractWorker('hun');
  }

  async initTesseractWorker(lang: string) {
    return createWorker(lang, 1, {
      logger: (m) => {
        console.log(m)
        if (m.status.includes('recognizing text')) {
          this.initializing = false;
          this.isRecognising = true;
          this.percentage = m.progress * 100;
        }
      },
    });
  }

  async ngOnInit() {
    this.user = await this.authService.getLoggedInUser();
    this.userObj = await this.authService.getLoggedInUserObj();

    this.worker = await this.workerPromise;
    await this.worker.terminate();
    
    this.workerPromise = this.initTesseractWorker(this.userObj.expensePreferences.language);
    this.worker = await this.workerPromise;
    this.worker.setParameters({
      // tessedit_char_whitelist: 'öszenÖBbakárty0123456789',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      tessedit_minimal_confidence: 70, // Adjust as needed
      oem: 1, // Specify the OCR Engine Mode (1 for LSTM, 3 for both LSTM and Legacy)
    })
  }

  async addExpense(type: 'form' | 'ocr') {
    console.log(this.user?.uid);
    if (type === 'form') {
      this.expenseService.addExpense(
        this.addExpenseForm.get('storeName')?.value,
        Number(this.addExpenseForm.get('amount')?.value),
        this.user?.uid as string
      );
    } else {


    }
  }

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  async doOCR() {
    if (this.fileInput.nativeElement.files) {
      const isOnline = await firstValueFrom(this.networkService.getNetworkState());
      if (isOnline) {
        this.processing = true;
        const response = await this.expenseService.doOcr(this.fileInput, this.userObj.expensePreferences.language);
        console.log(response);
        this.processedText = `Bolt neve: valami`;
        this.showAlert = true;
        this.processing = false;
      } else {
        this.initializing = true;
        const file = this.fileInput.nativeElement.files[0];
        const preprocessedImagePath = './images/' + file.name + '_preprocessed';
        const imageData = URL.createObjectURL(file);
        await this.preprocessImage(imageData, preprocessedImagePath);
      }
    }
  }

  async preprocessImage(imageData: string, output: string) {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);
      ctx?.putImageData(preprocessImage(canvas), 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg");
      const { data: { text } } = await this.worker.recognize(dataUrl);

      const extractedNumbers = this.extractNumbers(text);
      this.processedText = `Bolt neve: ${extractedNumbers} Ft`;

      this.showAlert = true;

      this.percentage = 0;
      this.isRecognising = false;
    };

    img.src = imageData;
  }

  extractNumbers(text: string) {
    const matches = text.match(/(?:\b(?:bankkártya|bankkartya|bank|kesz(?:penz)?|kész(?:pénz)?)\b\D*)([\d\s.,]+)\s*Ft/i);

    if (!matches) {
      return {};
    }

    const [, numbers] = matches;

    // Remove non-digit characters and convert to a number
    const extractedNumber = parseFloat(numbers.replace(/[^\d.]/g, '').replace(',', '.'));

    return extractedNumber;
  }

  modalClosed(event: any) {
    this.showAlert = false;
  }

  ngOnDestroy() {
    this.worker.terminate();
  }
}
