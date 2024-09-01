import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupperComponent } from './supper.component';

describe('SupperComponent', () => {
  let component: SupperComponent;
  let fixture: ComponentFixture<SupperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
