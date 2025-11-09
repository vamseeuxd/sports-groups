import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { IKnockoutMatch, ITeam } from '../../models';

@Component({
  selector: 'app-edit-match-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Edit Match"
      icon="bi-pencil"
      primaryText="Update"
      [primaryAction]="update"
      [primaryDisabled]="!isValid()"
      (closed)="close()">
      
      <form (ngSubmit)="update()">
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
        <div class="mb-3">
          <label class="form-label">Status:</label>
          <select [(ngModel)]="form.status" name="status" required class="form-control">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div class="mb-3" *ngIf="availableTeams.length > 0">
          <label class="form-label">Winner (Optional):</label>
          <select [(ngModel)]="form.winnerId" name="winnerId" class="form-control">
            <option value="">No Winner</option>
            <option *ngFor="let team of availableTeams" [value]="team.id">{{ team.name }}</option>
          </select>
        </div>
      </form>
    </app-shared-modal>
  `
})
export class EditMatchModalComponent {
  @Input() show = false;
  @Input() match: IKnockoutMatch | null = null;
  @Input() availableTeams: ITeam[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<any>();

  form = { round: 1, position: 1, scheduledDate: '', status: 'pending', winnerId: '' };

  ngOnChanges() {
    if (this.match) {
      let dateString = '';
      if (this.match.scheduledDate) {
        try {
          const dateObj = this.match.scheduledDate as any;
          const jsDate = dateObj.toDate ? dateObj.toDate() : new Date(this.match.scheduledDate);
          if (!isNaN(jsDate.getTime())) {
            dateString = jsDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Invalid date format:', this.match.scheduledDate);
        }
      }
      this.form = {
        round: this.match.round,
        position: this.match.position,
        scheduledDate: dateString,
        status: this.match.status,
        winnerId: this.match.winner?.id || ''
      };
    }
  }

  isValid() {
    return this.form.round > 0 && this.form.position > 0;
  }

  update = () => {
    if (this.isValid()) {
      this.updated.emit({ ...this.form });
      this.close();
    }
  }

  close() {
    this.form = { round: 1, position: 1, scheduledDate: '', status: 'pending', winnerId: '' };
    this.closed.emit();
  }
}