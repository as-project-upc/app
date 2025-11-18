import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReminders } from './list-reminders';

describe('ListReminders', () => {
  let component: ListReminders;
  let fixture: ComponentFixture<ListReminders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListReminders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListReminders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
