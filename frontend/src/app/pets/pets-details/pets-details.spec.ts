import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetsDetails } from './pets-details';

describe('PetsDetails', () => {
  let component: PetsDetails;
  let fixture: ComponentFixture<PetsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
