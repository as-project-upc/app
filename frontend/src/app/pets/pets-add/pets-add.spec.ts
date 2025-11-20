import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetsAdd } from './pets-add';

describe('PetsAdd', () => {
  let component: PetsAdd;
  let fixture: ComponentFixture<PetsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetsAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
