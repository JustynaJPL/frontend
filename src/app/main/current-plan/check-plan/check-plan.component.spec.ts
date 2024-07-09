import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckPlanComponent } from './check-plan.component';

describe('CheckPlanComponent', () => {
  let component: CheckPlanComponent;
  let fixture: ComponentFixture<CheckPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
