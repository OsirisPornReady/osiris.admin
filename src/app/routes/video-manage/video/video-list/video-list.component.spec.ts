import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoManageVideoListComponent } from './video-list.component';

describe('VideoManageVideoListComponent', () => {
  let component: VideoManageVideoListComponent;
  let fixture: ComponentFixture<VideoManageVideoListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoManageVideoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoManageVideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
