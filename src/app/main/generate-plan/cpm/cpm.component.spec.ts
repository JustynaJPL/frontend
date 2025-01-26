import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmComponent } from './cpm.component';

describe('CpmComponent', () => {
  let component: CpmComponent;
  let fixture: ComponentFixture<CpmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
