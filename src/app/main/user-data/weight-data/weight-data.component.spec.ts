import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightDataComponent } from './weight-data.component';

describe('WeightDataComponent', () => {
  let component: WeightDataComponent;
  let fixture: ComponentFixture<WeightDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeightDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
