import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  styleUrls: ['./header.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, NavigationComponent]
})
export class HeaderComponent  implements OnInit {
  @Input() isColored = false;
  constructor(protected router: Router) { }

  ngOnInit() {}
}
