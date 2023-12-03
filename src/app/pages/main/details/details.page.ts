import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Expense } from 'src/app/shared/models/expense.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ExpenseService } from 'src/app/shared/services/expense.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetailsPage implements OnInit {
  expense: Expense;
  // expenses: string[] = ['October','November','December'];
  months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  currentMonthIndex = 0;
  month: number;
  year: number;
  user: firebase.default.User | null;
  activeMonths: string[];

  constructor(private authService: AuthService, private expenseService: ExpenseService) { }

  async ngOnInit() {
    this.user = await this.authService.getLoggedInUser();    
    this.activeMonths = (await this.expenseService.getActiveMonths(this.user?.uid as string) as any).activeMonths;
    
    this.month = new Date().getMonth();
    // firebase call with filter to "year-monthIndex" + userId
    this.currentMonthIndex = this.activeMonths.findIndex((value: string) => value.includes((this.month + 1).toString()));
    this.expense = await this.expenseService.getExpense(this.activeMonths[this.currentMonthIndex], this.user?.uid as string);
  }

  // uj otlet, technikai doksi az expensesbe
  // id-je a user id-je es azt tarolna el, hogy mely honapokban aktiv
  // ez iras szempontjabol ugy nezne ki, hogy ha nem talalunk olyan doksit amelynek a honapja megegyezo (ilyenkor nem tudunk updatelni, csak setelni),
  // akkor amikor letrehozzuk az uj honapot, beleirjuk a technikai doksiba azt, hogy melyik honappal bovult

  // igy igazabol le lehetne kerni az aktiv honapokat is, ez initkor +1 read, viszont lehetne disabled nyil,
  // illetve monthpicker is kozepen
  // nem kellene bonyolult if else sem a next/prev metodusokhoz

  async nextMonth() {
    if (this.currentMonthIndex < this.activeMonths.length-1) {
      this.month++;
      this.currentMonthIndex++;
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
      this.expense = await this.expenseService.getExpense(this.activeMonths[this.currentMonthIndex], this.user?.uid as string);
    }
    // firebase call with filter to "year-monthIndex" + userId
  }

}
