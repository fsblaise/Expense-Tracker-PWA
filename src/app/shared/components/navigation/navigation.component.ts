import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  standalone: true,
  styleUrls: ['./navigation.component.scss'],
  imports: [IonicModule, CommonModule, RouterLink]
})
export class NavigationComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
