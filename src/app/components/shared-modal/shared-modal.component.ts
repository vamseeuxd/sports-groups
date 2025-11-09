import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade" [class.show]="show" [style.display]="show ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog" [class]="modalSize">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i *ngIf="icon" [class]="'bi ' + icon + ' me-2'"></i>
              {{ title }}
            </h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body" [style]="bodyStyle">
            <ng-content></ng-content>
          </div>
          <div class="modal-footer" *ngIf="showFooter">
            <button type="button" class="btn btn-secondary" (click)="close()">
              {{ cancelText }}
            </button>
            <button *ngIf="primaryAction" 
                    type="button" 
                    class="btn btn-primary" 
                    [disabled]="primaryDisabled"
                    (click)="primaryAction()">
              <span *ngIf="primaryLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="primaryIcon && !primaryLoading" [class]="'bi ' + primaryIcon + ' me-2'"></i>
              {{ primaryText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="show" class="modal-backdrop fade show" (click)="close()"></div>
  `
})
export class SharedModalComponent {
  @Input() show: boolean = false;
  @Input() title: string = '';
  @Input() icon?: string;
  @Input() modalSize: string = '';
  @Input() bodyStyle: string = '';
  @Input() showFooter: boolean = true;
  @Input() cancelText: string = 'Cancel';
  @Input() primaryText: string = 'Save';
  @Input() primaryIcon?: string;
  @Input() primaryDisabled: boolean = false;
  @Input() primaryLoading: boolean = false;
  @Input() primaryAction?: () => void;

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}