import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppNaviComponent } from './app-navi.component';

describe('AppNaviComponent', () => {
  let component: AppNaviComponent;
  let fixture: ComponentFixture<AppNaviComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNaviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
