import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PSM, createWorker } from 'tesseract.js';
// @ts-ignore
import preprocessImage from './preprocess';
@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddExpensePage implements OnInit, OnDestroy {
  workerPromise: Promise<Tesseract.Worker>;
  worker: Tesseract.Worker;
  @ViewChild('canvas') canvasRef!: ElementRef;
  @ViewChild('image') imageRef!: ElementRef;

  constructor() {
    this.workerPromise = createWorker("hun", 1, {
      logger: (m) => console.log(m),
    });
  }

  async ngOnInit() {
    this.worker = await this.workerPromise;
    this.worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    tessedit_minimal_confidence: 70, // Adjust as needed
    oem: 1, // Specify the OCR Engine Mode (1 for LSTM, 3 for both LSTM and Legacy)
    })
  }

  async doOCR(event: any) {
    const file = event?.target?.files[0];
    const preprocessedImagePath = './images/' + file.name + '_preprocessed';
    const imageData = URL.createObjectURL(file);

    await this.preprocessImage(imageData, preprocessedImagePath);
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

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = output + '.png';
      link.click();
    };

    img.src = imageData;
  }

  ngOnDestroy() {
    this.worker.terminate();
  }
}
