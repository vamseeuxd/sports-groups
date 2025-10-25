import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <li class="list-group-item list-group-item-primary mb-2 shadow-sm rounded-0 p-1">
      <div class="input-group">
        <input autofocus type="text" (keyup.enter)="onAdd(newGroupInput)" 
               #newGroupInput class="form-control" placeholder="New Group Name" />
        <button class="btn btn-primary" type="button" (click)="onAdd(newGroupInput)">
          <i class="bi bi-plus-lg"></i>
        </button>
      </div>
    </li>
  `
})
export class GroupFormComponent {
  @Input() userEmail!: string;
  @Output() add = new EventEmitter<string>();

  onAdd(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value) {
      this.add.emit(value);
      input.value = '';
    }
  }
}