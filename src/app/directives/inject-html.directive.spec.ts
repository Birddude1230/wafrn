import { ElementRef } from '@angular/core';
import { InjectHTMLDirective } from './inject-html.directive';

describe('InjectHTMLDirective', () => {
  it('should create an instance', () => {
    const directive = new InjectHTMLDirective(new ElementRef(null));
    expect(directive).toBeTruthy();
  });
});
