import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { IPlayerRegistration } from '../../models';

@Component({
  selector: 'app-edit-player-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Edit Player"
      icon="bi-pencil"
      primaryText="Update Player"
      [primaryAction]="update"
      [primaryDisabled]="!isValid()"
      (closed)="close()">
      
      <div *ngIf="editingPlayer">
        <div class="mb-3">
          <label class="form-label">Player Name *</label>
          <input type="text" class="form-control" [(ngModel)]="editingPlayer.playerName" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email Address *</label>
          <input type="email" class="form-control" [(ngModel)]="editingPlayer.playerEmail" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Gender *</label>
          <select class="form-control" [(ngModel)]="editingPlayer.gender" required>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Mobile Number *</label>
          <input type="tel" class="form-control" [(ngModel)]="editingPlayer.mobileNumber" required>
        </div>
      </div>
    </app-shared-modal>
  `
})
export class EditPlayerModalComponent {
  @Input() show = false;
  @Input() player: IPlayerRegistration | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<IPlayerRegistration>();

  editingPlayer: IPlayerRegistration | null = null;

  ngOnChanges() {
    if (this.player) {
      this.editingPlayer = { ...this.player };
    }
  }

  isValid(): boolean {
    return !!(this.editingPlayer?.playerName?.trim() && 
              this.editingPlayer?.playerEmail?.trim() && 
              this.editingPlayer?.gender && 
              this.editingPlayer?.mobileNumber?.trim());
  }

  update = () => {
    if (this.editingPlayer && this.isValid()) {
      this.updated.emit(this.editingPlayer);
      this.close();
    }
  }

  close() {
    this.editingPlayer = null;
    this.closed.emit();
  }
}