import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrls: ['./navbar.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NavbarComponent  implements OnInit {
  @Input() isColored = false;
  constructor(protected router: Router, protected location: Location) { }

  ngOnInit() {}
}
