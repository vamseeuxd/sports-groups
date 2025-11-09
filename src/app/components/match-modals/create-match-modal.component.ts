import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';

@Component({
  selector: 'app-create-match-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Create New Match"
      icon="bi-plus"
      primaryText="Create"
      [primaryAction]="create"
      [primaryDisabled]="!isValid()"
      (closed)="close()">
      
      <form (ngSubmit)="create()">
        <div class="mb-3">
          <label class="form-label">Round:</label>
          <input type="number" [(ngModel)]="form.round" name="round" min="1" required class="form-control">
        </div>
        <div class="mb-3">
          <label class="form-label">Position:</label>
          <input type="number" [(ngModel)]="form.position" name="position" min="1" required class="form-control">
        </div>
        <div class="mb-3">
          <label class="form-label">Scheduled Date (Optional):</label>
          <input type="date" [(ngModel)]="form.scheduledDate" name="scheduledDate" class="form-control">
        </div>
      </form>
    </app-shared-modal>
  `
})
export class CreateMatchModalComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();

  form = { round: 1, position: 1, scheduledDate: '' };

  isValid() {
    return this.form.round > 0 && this.form.position > 0;
  }

  create = () => {
    if (this.isValid()) {
      this.created.emit({ ...this.form });
      this.close();
    }
  }

  close() {
    this.form = { round: 1, position: 1, scheduledDate: '' };
    this.closed.emit();
  }
}