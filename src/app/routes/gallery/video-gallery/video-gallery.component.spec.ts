import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { GalleryVideoGalleryComponent } from './video-gallery.component';

describe('GalleryVideoGalleryComponent', () => {
  let component: GalleryVideoGalleryComponent;
  let fixture: ComponentFixture<GalleryVideoGalleryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryVideoGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryVideoGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
