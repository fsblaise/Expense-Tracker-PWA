import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationComponent } from "../../shared/components/navigation/navigation.component";

@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, NavigationComponent]
})
export class MainPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
