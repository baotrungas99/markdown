import { Directive, ElementRef, Input, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSyncScroll]',
  standalone: true
})
export class SyncScrollDirective implements OnChanges {
  @Input('appSyncScroll') targetElement!: HTMLElement;
  @Input() syncEnabled: boolean = true; // Kiểm soát đồng bộ scroll
  
  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['syncEnabled']) {
      // console.log('Sync Scroll Enabled:', this.syncEnabled);
    }
  }

  @HostListener('scroll') onScroll() {
    if (!this.syncEnabled || !this.targetElement) return;

    const source = this.el.nativeElement;
    const target = this.targetElement;

    const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = scrollRatio * (target.scrollHeight - target.clientHeight);
  }
}