import { Router, RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { getSignInForm } from 'src/app/shared/forms/signIn.form';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  signInForm: FormGroup = getSignInForm();
  loading = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
  }

  async login() {
    this.loading = true;
    if (this.signInForm.valid) {
      const user = await this.authService.signIn(this.signInForm.get('email')?.value, this.signInForm.get('password')?.value);
      if (user) {
        await this.router.navigateByUrl('/main');
      }
    }
    this.loading = false;
  }

}
