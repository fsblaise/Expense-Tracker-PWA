import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
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
  loading = false;

  constructor(private router: Router, private authService: AuthService, private toastController: ToastController) { }

  ngOnInit() {
  }

  async signUp() {
    this.loading = true;
    if (this.signUpForm.get('password')?.value === this.signUpForm.get('rePassword')?.value && this.signUpForm.valid) {
      console.log(this.signUpForm.get('fullName')?.value);
      const user = await this.authService.signUp(this.signUpForm.get('email')?.value,
                                    this.signUpForm.get('password')?.value,
                                    this.signUpForm.get('fullName')?.value);
      if (user) {
        await this.router.navigateByUrl('/main');
      }
    } else {
      if (this.signUpForm.get('password')?.value !== this.signUpForm.get('rePassword')?.value) {
        const toast = await this.toastController.create({
          message: 'Passwords are not matching!',
          cssClass: "custom-toast",
          duration: 2000
        });
        await toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Something went wrong!',
          cssClass: "custom-toast",
          duration: 2000
        });
        await toast.present();
      }
    }
    this.loading = false;
  }

}
