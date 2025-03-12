import { Directive, ElementRef, Input, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSyncScroll]',
  standalone: true
})
export class SyncScrollDirective implements OnChanges {
  @Input('appSyncScroll') targetElement!: HTMLElement;
  @Input() syncEnabled: boolean = true;

  private isSyncing = false; // Kiểm soát trạng thái đồng bộ

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['syncEnabled']) {
      this.isSyncing = false; // Reset trạng thái khi thay đổi
    }
  }

  @HostListener('scroll') onScroll() {
    if (!this.syncEnabled || !this.targetElement || this.isSyncing) return;

    const source = this.el.nativeElement;
    const target = this.targetElement;

    this.isSyncing = true; // Đánh dấu đang đồng bộ

    const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = scrollRatio * (target.scrollHeight - target.clientHeight);

    // Đặt timeout để tránh gọi lại liên tục gây lag
    setTimeout(() => {
      this.isSyncing = false;
    }, 10);
  }

  // Khi chuột dừng cuộn -> Ngừng ngay việc đồng bộ
  @HostListener('wheel', ['$event']) onWheel(event: WheelEvent) {
    if (event.deltaY === 0) {
      this.isSyncing = false;
    }
  }

  // Khi dừng vuốt trên mobile -> Ngừng ngay việc đồng bộ
  @HostListener('touchend') onTouchEnd() {
    this.isSyncing = false;
  }

  // Khi dừng thao tác cuộn (trackpad, click) -> Ngừng ngay
  @HostListener('mouseup') onMouseUp() {
    this.isSyncing = false;
  }
}