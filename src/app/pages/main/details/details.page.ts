import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Expense } from 'src/app/shared/models/expense.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ExpenseService } from 'src/app/shared/services/expense.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogComponent } from "../../../shared/components/dialog/dialog.component";
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  animations: [
    trigger('slideInOut', [
      transition(':increment', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
    ]),
    trigger('openClose', [
      state('true', style({ height: '*' })),
      state('false', style({ height: '0px' })),
      transition('false <=> true', [animate(300)])
    ])
  ],
  imports: [IonicModule, CommonModule, FormsModule, DialogComponent]
})
export class DetailsPage implements OnInit {
  expense: Expense;
  // expenses: string[] = ['October','November','December'];
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  currentMonthIndex = 0;
  month: number;
  year: number;
  user: firebase.default.User | null;
  activeMonths: string[];
  loading = false;
  animationState: string = 'current'; // Initial state
  small = false;
  guestsOpened = false;
  summaryOpened = false;
  dateOpened: boolean[] = [];
  userObj: User;

  constructor(private authService: AuthService, private expenseService: ExpenseService) { }

  async ngOnInit() {
    this.onResize('');
    this.loading = true;
    this.user = await this.authService.getLoggedInUser();
    this.userObj = await this.authService.getLoggedInUserObj();
    console.log('getActiveMonth on details page')
    const activeMonthsObj = await this.expenseService.getActiveMonths(this.user?.uid as string);
    if (activeMonthsObj) {
      this.activeMonths = activeMonthsObj.activeMonths;
      this.month = new Date().getMonth();
      // firebase call with filter to "year-monthIndex" + userId
      this.currentMonthIndex = this.activeMonths.findIndex((value: string) => value.includes((this.month + 1).toString()));
      console.log('details page');
      console.log(this.activeMonths[this.currentMonthIndex]);
      console.log(this.user?.uid as string);
      this.expense = await this.expenseService.getExpense(this.activeMonths[this.currentMonthIndex], this.user?.uid as string);
    }
    this.loading = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 768) {
      this.small = true;
    } else {
      this.small = false;
    }
  }

  // uj otlet, technikai doksi az expensesbe
  // id-je a user id-je es azt tarolna el, hogy mely honapokban aktiv
  // ez iras szempontjabol ugy nezne ki, hogy ha nem talalunk olyan doksit amelynek a honapja megegyezo (ilyenkor nem tudunk updatelni, csak setelni),
  // akkor amikor letrehozzuk az uj honapot, beleirjuk a technikai doksiba azt, hogy melyik honappal bovult

  // igy igazabol le lehetne kerni az aktiv honapokat is, ez initkor +1 read, viszont lehetne disabled nyil,
  // illetve monthpicker is kozepen
  // nem kellene bonyolult if else sem a next/prev metodusokhoz

  async nextMonth() {
    if (this.currentMonthIndex < this.activeMonths.length - 1) {
      this.month++;
      this.currentMonthIndex++;
      console.log(this.activeMonths[this.currentMonthIndex]);
      console.log(this.user?.uid as string);
      this.expense = await this.expenseService.getExpense(this.activeMonths[this.currentMonthIndex], this.user?.uid as string);
    }
    // if currentMonthIndex !== expenses.length - 1 : just change the index
    // else: if currentMonth === december : 
    // currentmonthindex = 0
    // year++
    // firebase call with filter to "(year)-(currentmonthindex)" + userId [increment year, zero monthindex, fetch]
    // else: firebase call with filter to "(year)-(++currentmonthindex)" + userId [just fetch the next month]
  }

  async prevMonth() {
    if (this.currentMonthIndex > 0) {
      this.month--;
      this.currentMonthIndex--;
      console.log(this.activeMonths[this.currentMonthIndex]);
      console.log(this.user?.uid as string);
      this.expense = await this.expenseService.getExpense(this.activeMonths[this.currentMonthIndex], this.user?.uid as string);
    }
    // firebase call with filter to "year-monthIndex" + userId
  }

  openDate(i: number) {
    this.dateOpened[i] = true;
    console.log(this.dateOpened[i]);
    console.log(i);
  }

}
