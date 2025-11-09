import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Create New Team"
      icon="bi-plus-lg"
      primaryText="Create Team"
      [primaryAction]="create"
      [primaryDisabled]="!isValid()"
      (closed)="close()">
      
      <div class="mb-3">
        <label class="form-label">Team Name</label>
        <input type="text" 
               class="form-control" 
               [(ngModel)]="form.name"
               [class.is-invalid]="form.name.trim() && isNameTaken"
               placeholder="Enter team name" 
               maxlength="50">
        <div *ngIf="form.name.trim() && isNameTaken" class="invalid-feedback">
          Team name already exists
        </div>
      </div>
    </app-shared-modal>
  `
})
export class CreateTeamModalComponent {
  @Input() show = false;
  @Input() isNameTaken = false;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<string>();

  form = { name: '' };

  isValid() {
    return this.form.name.trim() && !this.isNameTaken;
  }

  create = () => {
    if (this.isValid()) {
      this.created.emit(this.form.name.trim());
      this.close();
    }
  }

  close() {
    this.form = { name: '' };
    this.closed.emit();
  }
}