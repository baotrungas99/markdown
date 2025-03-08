import { ElementRef } from '@angular/core';
import { SyncScrollDirective } from './sync-scroll.directive';

describe('SyncScrollDirective', () => {
  it('should create an instance', () => {
    const el = new ElementRef(null);
    const directive = new SyncScrollDirective(el);
    expect(directive).toBeTruthy();
  });
});
