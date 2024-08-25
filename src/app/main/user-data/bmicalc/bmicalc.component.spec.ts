import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmicalcComponent } from './bmicalc.component';

describe('BmicalcComponent', () => {
  let component: BmicalcComponent;
  let fixture: ComponentFixture<BmicalcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmicalcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BmicalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
