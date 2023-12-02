import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OverlayEventDetail } from '@ionic/core/components';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DialogComponent implements OnInit {

  @Input() isOpen: boolean;
  @Input() msg: string;
  @Input() title: string;
  @Input() confirmButton: string = 'Accept';
  @Input() cancelButton: string = 'Cancel';
  @Input() type: 'basic' | 'error' | 'confirm';
  @Output() closeEvent: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  onClose(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    this.closeEvent.emit(ev.detail.role);
  }
}
