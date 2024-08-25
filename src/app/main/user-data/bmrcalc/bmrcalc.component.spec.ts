import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmrcalcComponent } from './bmrcalc.component';

describe('BmrcalcComponent', () => {
  let component: BmrcalcComponent;
  let fixture: ComponentFixture<BmrcalcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmrcalcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BmrcalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
