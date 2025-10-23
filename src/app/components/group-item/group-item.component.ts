import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IGroupRole } from '../../models/group.model';

@Component({
  selector: 'app-group-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <li [class.py-2]="!isEditing" [class.p-1]="isEditing"
        class="list-group-item list-group-item-warning mb-2 shadow-sm rounded-0 p-1 d-flex justify-content-between align-items-center">
      
      @if (isEditing) {
        <div class="input-group">
          <input autofocus [value]="group.name" type="text" 
                 (keyup.enter)="onSave(editInput)" #editInput
                 (keyup.escape)="onCancel()" class="form-control" 
                 placeholder="Group Name to Update" />
          <button class="btn btn-outline-success" type="button" (click)="onSave(editInput)">
            <i class="bi bi-floppy-fill"></i>
          </button>
          <button class="btn btn-outline-secondary" type="button" (click)="onCancel()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      } @else {
        {{ group.name }}
        @if (group.role === 'admin') {
          <div>
            <button type="button" class="btn btn-sm btn-outline-primary border-0 me-1" (click)="onEdit()">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger border-0" (click)="onDelete()">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        }
      }
    </li>
  `
})
export class GroupItemComponent {
  @Input() group!: IGroupRole;
  @Input() isEditing = false;
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit() {
    this.edit.emit();
  }

  onSave(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value) {
      this.save.emit(value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onDelete() {
    this.delete.emit();
  }
}