import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReminders } from './create-reminders';

describe('CreateReminders', () => {
  let component: CreateReminders;
  let fixture: ComponentFixture<CreateReminders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReminders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReminders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
