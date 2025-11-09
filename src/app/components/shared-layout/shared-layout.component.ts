import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'ngx-bootstrap/popover';

@Component({
  selector: 'app-shared-layout',
  standalone: true,
  imports: [CommonModule, PopoverModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i *ngIf="icon" [class]="'bi ' + icon + ' me-2'"></i>
          {{ title }}
          <span *ngIf="count !== undefined" class="badge text-bg-secondary ms-2 fw-normal">{{ count }}</span>
        </h5>
        
        <ng-container *ngIf="actions && actions.length > 0">
          <ng-template #popTemplate>
            <ul class="list-group p-1 shadow border">
              <li *ngFor="let action of actions" 
                  class="list-group-item" 
                  [class]="action.class || ''"
                  role="button" 
                  (click)="contentMenu.hide(); action.handler()">
                <i *ngIf="action.icon" [class]="'bi ' + action.icon + ' me-2'"></i>
                {{ action.label }}
              </li>
            </ul>
          </ng-template>
          <button type="button" 
                  class="btn btn-outline-dark border-0 btn-sm position-absolute top-0 end-0 m-1"
                  #contentMenu="bs-popover" 
                  [popover]="popTemplate" 
                  container="body" 
                  placement="bottom" 
                  [outsideClick]="true">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
        </ng-container>
      </div>

      <div class="card-body" [style]="bodyStyle">
        <div *ngIf="loading" class="loading-state text-center py-3">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">{{ loadingText || 'Loading...' }}</p>
        </div>

        <div *ngIf="!loading && showEmptyState" class="empty-state text-center text-muted py-4">
          <i [class]="'bi ' + (emptyIcon || 'bi-inbox') + ' display-4'"></i>
          <p class="mt-2">{{ emptyText || 'No items found.' }}</p>
          <button *ngIf="emptyActionText" 
                  class="btn btn-outline-primary btn-sm mt-2" 
                  (click)="emptyAction.emit()">
            <i *ngIf="emptyActionIcon" [class]="'bi ' + emptyActionIcon + ' me-2'"></i>
            {{ emptyActionText }}
          </button>
        </div>

        <ng-content *ngIf="!loading && !showEmptyState"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .loading-state, .empty-state {
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class SharedLayoutComponent {
  @Input() title: string = '';
  @Input() icon?: string;
  @Input() count?: number;
  @Input() loading: boolean = false;
  @Input() loadingText?: string;
  @Input() showEmptyState: boolean = false;
  @Input() emptyText?: string;
  @Input() emptyIcon?: string;
  @Input() emptyActionText?: string;
  @Input() emptyActionIcon?: string;
  @Input() bodyStyle: string = 'max-height: calc(100dvh - 200px); overflow: auto; min-height: calc(100dvh - 200px);';
  @Input() actions?: Array<{
    label: string;
    icon?: string;
    handler: () => void;
    class?: string;
  }> = [];

  @Output() emptyAction = new EventEmitter<void>();
}