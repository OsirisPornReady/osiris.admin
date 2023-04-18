import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoManageVideoEditComponent } from './video-edit.component';

describe('VideoManageVideoEditComponent', () => {
  let component: VideoManageVideoEditComponent;
  let fixture: ComponentFixture<VideoManageVideoEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoManageVideoEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoManageVideoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
