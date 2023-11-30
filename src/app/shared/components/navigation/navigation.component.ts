import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  standalone: true,
  styleUrls: ['./navigation.component.scss'],
  imports: [IonicModule, CommonModule, RouterLink]
})
export class NavigationComponent  implements OnInit {

  constructor(protected router: Router, private authService: AuthService) { }

  ngOnInit() {}

  async logOut() {
    await this.authService.signOut();
    await this.router.navigateByUrl('/');
  }

}
