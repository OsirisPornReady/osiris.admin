import { Directive, ElementRef, AfterViewInit, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCustomNzBadgeStatusColor]'
})
export class CustomNzBadgeStatusColorDirective implements AfterViewInit {
  @Input() statusColor!: string;

  constructor(private readonly el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    console.log(this.statusColor)
    let dom = this.el.nativeElement.querySelector('span.ant-badge-status-dot:after');
    if (dom) {
      // this.renderer.setAttribute(dom, 'style', `border: 1px solid ${'red'}`);
    }
  }
}
