import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { ITeam, IPlayerRegistration } from '../../models';

@Component({
  selector: 'app-manage-players-modal',
  standalone: true,
  imports: [CommonModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Manage Players"
      [title]="'Manage Players - ' + (team?.name || '')"
      icon="bi-people"
      modalSize="modal-lg"
      primaryText="Save Changes"
      [primaryAction]="save"
      bodyStyle="overflow-y: auto; max-height: calc(100dvh - 280px); min-height: calc(100dvh - 280px);"
      (closed)="close()">
      
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title">Available Players</h6>
              <div class="list-group" style="overflow-y: auto; max-height: var(--half-screen-height); min-height: var(--half-screen-height);">
                <div *ngFor="let player of availablePlayers"
                     class="list-group-item d-flex justify-content-between align-items-center"
                     [class.active]="isPlayerSelected(player.id!)">
                  <div>
                    <strong>{{player.playerName}}</strong>
                    <small class="text-muted d-block">{{player.playerEmail}}</small>
                  </div>
                  <div>
                    <span class="badge bg-secondary me-2">{{player.gender}}</span>
                    <input type="checkbox" 
                           class="form-check-input" 
                           [checked]="isPlayerSelected(player.id!)"
                           (change)="togglePlayerSelection(player.id!)">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">Selected Players ({{selectedPlayers.length}})</h6>
              <div class="list-group" style="overflow-y: auto; max-height: var(--half-screen-height); min-height: var(--half-screen-height);">
                <div *ngFor="let playerId of selectedPlayers"
                     class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{getPlayerNameById(playerId)}}</strong>
                    <span *ngIf="team?.captainId === playerId" class="badge bg-warning text-dark ms-1">Captain</span>
                  </div>
                  <div class="btn-group btn-group-sm">
                    <button *ngIf="team?.captainId !== playerId" 
                            class="btn btn-outline-warning btn-sm"
                            (click)="setCaptain(playerId)" 
                            title="Make captain">
                      <i class="bi bi-star"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" 
                            (click)="togglePlayerSelection(playerId)"
                            title="Remove">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-shared-modal>
  `
})
export class ManagePlayersModalComponent {
  @Input() show = false;
  @Input() team: ITeam | null = null;
  @Input() availablePlayers: IPlayerRegistration[] = [];
  @Input() selectedPlayers: string[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() playersUpdated = new EventEmitter<{playerIds: string[], captainId?: string}>();

  private captainId?: string;

  ngOnChanges() {
    if (this.team) {
      this.captainId = this.team.captainId;
    }
  }

  togglePlayerSelection(playerId: string) {
    const index = this.selectedPlayers.indexOf(playerId);
    if (index > -1) {
      this.selectedPlayers.splice(index, 1);
      if (this.captainId === playerId) {
        this.captainId = undefined;
      }
    } else {
      this.selectedPlayers.push(playerId);
    }
  }

  isPlayerSelected(playerId: string): boolean {
    return this.selectedPlayers.includes(playerId);
  }

  getPlayerNameById(playerId: string): string {
    return this.availablePlayers.find(p => p.id === playerId)?.playerName || 'Unknown';
  }

  setCaptain(playerId: string) {
    this.captainId = playerId;
  }

  save = () => {
    this.playersUpdated.emit({
      playerIds: [...this.selectedPlayers],
      captainId: this.captainId
    });
    this.close();
  }

  close() {
    this.closed.emit();
  }
}