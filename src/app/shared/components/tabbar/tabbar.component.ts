import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabbar',
  templateUrl: './tabbar.component.html',
  standalone: true,
  styleUrls: ['./tabbar.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TabbarComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
