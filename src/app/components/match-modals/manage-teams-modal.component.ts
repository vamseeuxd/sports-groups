import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { ITeam } from '../../models';

@Component({
  selector: 'app-manage-teams-modal',
  standalone: true,
  imports: [CommonModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Manage Match Teams"
      icon="bi-gear"
      primaryText="Save Teams"
      [primaryAction]="save"
      (closed)="close()">
      
      <p>Select up to 2 teams for this match:</p>
      
      <div class="teams-list mb-3">
        <div *ngFor="let team of availableTeams" 
             class="list-group-item d-flex justify-content-between align-items-center"
             [class.active]="isTeamSelected(team.id!)"
             (click)="toggleTeamSelection(team.id!)">
          <span>{{ team.name }}</span>
          <span class="badge bg-secondary">({{ team.playerIds.length }} players)</span>
        </div>
      </div>
      
      <div class="selected-teams">
        <h6>Selected Teams ({{ selectedTeams.length }}/2):</h6>
        <div *ngFor="let teamId of selectedTeams" class="badge bg-primary me-2">
          {{ getTeamNameById(teamId) }}
        </div>
      </div>
    </app-shared-modal>
  `,
  styles: [`
    .teams-list .list-group-item {
      cursor: pointer;
      border: 1px solid var(--bs-border-color);
      margin-bottom: 0.25rem;
    }
    .teams-list .list-group-item:hover {
      background-color: var(--bs-light);
    }
    .teams-list .list-group-item.active {
      background-color: var(--bs-primary);
      color: white;
    }
  `]
})
export class ManageTeamsModalComponent {
  @Input() show = false;
  @Input() availableTeams: ITeam[] = [];
  @Input() selectedTeams: string[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() teamsUpdated = new EventEmitter<string[]>();

  toggleTeamSelection(teamId: string) {
    const index = this.selectedTeams.indexOf(teamId);
    if (index > -1) {
      this.selectedTeams.splice(index, 1);
    } else if (this.selectedTeams.length < 2) {
      this.selectedTeams.push(teamId);
    }
  }

  isTeamSelected(teamId: string): boolean {
    return this.selectedTeams.includes(teamId);
  }

  getTeamNameById(teamId: string): string {
    return this.availableTeams.find(t => t.id === teamId)?.name || 'Unknown';
  }

  save = () => {
    this.teamsUpdated.emit([...this.selectedTeams]);
    this.close();
  }

  close() {
    this.closed.emit();
  }
}