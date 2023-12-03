import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PSM, createWorker } from 'tesseract.js';
// @ts-ignore
import preprocessImage from './preprocess';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { ExpenseService } from 'src/app/shared/services/expense.service';

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
  imports: [IonicModule, CommonModule, FormsModule, DialogComponent]
})
export class AddExpensePage implements OnInit, OnDestroy {
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


  constructor(private expenseService: ExpenseService) {
    this.workerPromise = createWorker("hun", 1, {
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
    this.worker = await this.workerPromise;
    this.worker.setParameters({
      // tessedit_char_whitelist: 'öszenÖBbakárty0123456789',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      tessedit_minimal_confidence: 70, // Adjust as needed
      oem: 1, // Specify the OCR Engine Mode (1 for LSTM, 3 for both LSTM and Legacy)
    })
  }

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  async doOCR() {
    // this.initializing = true;
    // const file = event?.target?.files[0];
    // const preprocessedImagePath = './images/' + file.name + '_preprocessed';
    // const imageData = URL.createObjectURL(file);

    // await this.preprocessImage(imageData, preprocessedImagePath);
    // console.log(this.selectedFile);
    this.processing = true;
    const response = await this.expenseService.doOcr(this.fileInput);
    console.log(response);
    this.processing = false;
    // const { data: { text } } = await this.worker.recognize(file);

    // console.log(text);
    // console.log(event?.target?.files[0]);
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
      console.log(text);

      const extractedNumbers = this.extractNumbers(text);
      // console.log('Extracted result:');
      this.processedText = `Bolt neve: ${extractedNumbers} Ft`;
      console.log(extractedNumbers);

      this.showAlert = true;
      // const link = document.createElement('a');
      // link.href = dataUrl;
      // link.download = output + '.png';
      // link.click();
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

    // console.log(matches);


    const [, numbers] = matches;

    // Remove non-digit characters and convert to a number
    const extractedNumber = parseFloat(numbers.replace(/[^\d.]/g, '').replace(',', '.'));

    return extractedNumber;
  }

  modalClosed(event: any) {
    console.log(event);
    this.showAlert = false;
  }

  ngOnDestroy() {
    this.worker.terminate();
  }
}
