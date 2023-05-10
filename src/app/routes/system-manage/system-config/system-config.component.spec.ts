import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemManageSystemConfigComponent } from './system-config.component';

describe('SystemManageSystemConfigComponent', () => {
  let component: SystemManageSystemConfigComponent;
  let fixture: ComponentFixture<SystemManageSystemConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemManageSystemConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemManageSystemConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
