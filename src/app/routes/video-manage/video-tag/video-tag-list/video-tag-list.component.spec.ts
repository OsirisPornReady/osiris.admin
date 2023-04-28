import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoManageVideoTagListComponent } from './video-tag-list.component';

describe('VideoManageVideoTagListComponent', () => {
  let component: VideoManageVideoTagListComponent;
  let fixture: ComponentFixture<VideoManageVideoTagListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoManageVideoTagListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoManageVideoTagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
