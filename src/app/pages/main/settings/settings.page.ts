import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { getExpenseSettingsForm, getProfileSettingsForm } from 'src/app/shared/forms/settings.form';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class SettingsPage implements OnInit {
  profileSettingsForm: FormGroup = getProfileSettingsForm();
  expenseSettingsForm: FormGroup = getExpenseSettingsForm();
  user: User | null;
  darkMode: boolean;
  loading: boolean;

  constructor(private authService: AuthService) { }

  async ngOnInit() {
    this.loading = true;

    this.user = await this.authService.getLoggedInUserObj();
    if (this.user) {
      this.profileSettingsForm.get('syncDarkMode')?.setValue(this.user?.syncDarkMode);
      this.profileSettingsForm.get('darkMode')?.setValue(this.user?.darkMode);
      this.profileSettingsForm.get('fullName')?.setValue(this.user?.fullName);
      this.expenseSettingsForm.get('currency')?.setValue(this.user?.expensePreferences.currency);
      this.expenseSettingsForm.get('language')?.setValue(this.user?.expensePreferences.language);
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.initializeDarkTheme(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkTheme(mediaQuery.matches));

    this.loading = false;
  }

  initializeDarkTheme(isDark: boolean) {
    if (this.user && this.user.syncDarkMode) {
      this.profileSettingsForm.get('darkMode')?.setValue(this.user.darkMode as boolean);
      this.toggleDarkTheme(this.user.darkMode as boolean);
    } else {
      this.profileSettingsForm.get('darkMode')?.setValue(isDark);
      this.toggleDarkTheme(isDark);
    }
  }

  toggleChange(ev: any) {
    this.toggleDarkTheme(ev.detail.checked);
  }

  toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  async updateProfile() {
    if (this.user) {
      this.user.syncDarkMode = this.profileSettingsForm.get('syncDarkMode')?.value;
      if (this.user.syncDarkMode) {
        this.user.darkMode = this.profileSettingsForm.get('darkMode')?.value;
      } else {
        this.user.darkMode = null;
      }
      this.user.fullName = this.profileSettingsForm.get('fullName')?.value;

      await this.authService.updateUser(this.user);
    }
  }

  async updateExpenses() {
    if (this.user) {
      this.user.expensePreferences.currency = this.expenseSettingsForm.get('currency')?.value;
      this.user.expensePreferences.language = this.expenseSettingsForm.get('language')?.value;

      await this.authService.updateUser(this.user);
    }
  }
}
