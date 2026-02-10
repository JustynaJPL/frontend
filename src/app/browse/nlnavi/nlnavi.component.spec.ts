import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NlnaviComponent } from './nlnavi.component';

describe('NlnaviComponent', () => {
  let component: NlnaviComponent;
  let fixture: ComponentFixture<NlnaviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NlnaviComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NlnaviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
