import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAppointments } from './list-appointments';

describe('ListAppointments', () => {
  let component: ListAppointments;
  let fixture: ComponentFixture<ListAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAppointments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAppointments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
