import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  template: ''
})
export abstract class BaseModalComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<any>();

  close() {
    this.show = false;
    this.closed.emit();
  }

  confirm(data?: any) {
    this.confirmed.emit(data);
    this.close();
  }
}