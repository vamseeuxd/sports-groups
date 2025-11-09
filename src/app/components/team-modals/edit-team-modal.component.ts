import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { ITeam } from '../../models';

@Component({
  selector: 'app-edit-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Edit Team"
      icon="bi-pencil"
      primaryText="Update Team"
      [primaryAction]="update"
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
export class EditTeamModalComponent {
  @Input() show = false;
  @Input() team: ITeam | null = null;
  @Input() isNameTaken = false;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<string>();

  form = { name: '' };

  ngOnChanges() {
    if (this.team) {
      this.form = { name: this.team.name };
    }
  }

  isValid() {
    return this.form.name.trim() && !this.isNameTaken;
  }

  update = () => {
    if (this.isValid()) {
      this.updated.emit(this.form.name.trim());
      this.close();
    }
  }

  close() {
    this.form = { name: '' };
    this.closed.emit();
  }
}