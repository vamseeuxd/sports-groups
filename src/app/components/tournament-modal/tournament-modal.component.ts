import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITournament, SPORTS_OPTIONS } from '../../models/group.model';

@Component({
  selector: 'app-tournament-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{isEdit ? 'Edit' : 'Add'}} Tournament</h4>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label class="form-label">Tournament Name</label>
        <input type="text" class="form-control" [(ngModel)]="tournament.name" placeholder="Enter tournament name">
      </div>
      <div class="mb-3">
        <label class="form-label">Start Date</label>
        <input type="date" class="form-control" [(ngModel)]="startDateString">
      </div>
      <div class="mb-3">
        <label class="form-label">Sport</label>
        <select class="form-select" [(ngModel)]="tournament.sport">
          <option value="">Select Sport</option>
          @for (sport of sportsOptions; track sport) {
            <option [value]="sport">{{sport}}</option>
          }
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea class="form-control" rows="3" [(ngModel)]="tournament.description" placeholder="Enter description"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="save()">{{isEdit ? 'Update' : 'Create'}}</button>
    </div>
  `
})
export class TournamentModalComponent {
  tournament: Partial<ITournament> = {};
  startDateString = '';
  isEdit = false;
  result: any = null;
  sportsOptions = SPORTS_OPTIONS;

  constructor(public bsModalRef: BsModalRef) {}

  save() {
    if (this.startDateString) {
      this.tournament.startDate = new Date(this.startDateString);
    }
    this.result = this.tournament;
    this.bsModalRef.hide();
  }

  cancel() {
    this.result = null;
    this.bsModalRef.hide();
  }
}