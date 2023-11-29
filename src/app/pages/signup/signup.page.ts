import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { getSignUpForm } from 'src/app/shared/forms/signUp.form';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule]
})
export class SignupPage implements OnInit {
  signUpForm: FormGroup = getSignUpForm();

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
  }

  async signUp() {
    if (this.signUpForm.get('password')?.value === this.signUpForm.get('rePassword')?.value) {
      console.log(this.signUpForm.get('fullName')?.value);
      await this.authService.signUp(this.signUpForm.get('email')?.value, this.signUpForm.get('password')?.value);
      await this.router.navigateByUrl('/main');
    } else {
      // TODO: snackbar for not matching passwords.
    }
  }

}
