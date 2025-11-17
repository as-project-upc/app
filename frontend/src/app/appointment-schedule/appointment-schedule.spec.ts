import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSchedule } from './appointment-schedule';

describe('AppointmentSchedule', () => {
  let component: AppointmentSchedule;
  let fixture: ComponentFixture<AppointmentSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
