import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatementsPage } from './statements.page';

describe('StatementsPage', () => {
  let component: StatementsPage;
  let fixture: ComponentFixture<StatementsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StatementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
