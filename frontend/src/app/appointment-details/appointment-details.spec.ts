import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDetails } from './appointment-details';

describe('AppointmentDetails', () => {
  let component: AppointmentDetails;
  let fixture: ComponentFixture<AppointmentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
