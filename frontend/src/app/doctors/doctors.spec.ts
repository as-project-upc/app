import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Doctors } from './doctors';

describe('Doctors', () => {
  let component: Doctors;
  let fixture: ComponentFixture<Doctors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Doctors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Doctors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
