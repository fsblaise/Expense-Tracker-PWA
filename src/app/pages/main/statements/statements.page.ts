import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-statements',
  templateUrl: './statements.page.html',
  styleUrls: ['./statements.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StatementsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
