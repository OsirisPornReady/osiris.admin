import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoManageVideoTagEditComponent } from './video-tag-edit.component';

describe('VideoManageVideoTagEditComponent', () => {
  let component: VideoManageVideoTagEditComponent;
  let fixture: ComponentFixture<VideoManageVideoTagEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoManageVideoTagEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoManageVideoTagEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
