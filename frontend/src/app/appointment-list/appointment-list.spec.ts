import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentList } from './appointment-list';

describe('AppointmentList', () => {
  let component: AppointmentList;
  let fixture: ComponentFixture<AppointmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
