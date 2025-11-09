import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { CopyToClipboardDirective } from '../../directives';
import { IPlayerRegistration } from '../../models';

@Component({
  selector: 'app-unassigned-players-modal',
  standalone: true,
  imports: [CommonModule, SharedModalComponent, CopyToClipboardDirective],
  template: `
    <app-shared-modal
      [show]="show"
      title="Unassigned Players"
      [title]="'Unassigned Players (' + unassignedPlayers.length + ')'"
      icon="bi-person-x"
      modalSize="modal-lg"
      [showFooter]="false"
      (closed)="close()">
      
      <div *ngIf="unassignedPlayers.length === 0" class="text-center text-muted py-4">
        <i class="bi bi-check-circle display-4"></i>
        <p class="mt-2">All players are assigned to teams!</p>
      </div>
      
      <div *ngIf="unassignedPlayers.length > 0" class="row" style="overflow-y: auto;max-height: calc(100dvh - 150px);min-height: calc(100dvh - 150px);">
        <div *ngFor="let player of unassignedPlayers" class="col-md-12 col-lg-12 mb-3">
          <div class="card">
            <div class="card-body py-2">
              <h6 class="card-title d-flex align-items-center justify-content-between">{{player.playerName}} 
                <span class="badge bg-warning text-dark fw-normal">
                  @if (player.gender.toLowerCase() === 'female') {
                    <i class="bi bi-gender-female me-1"></i>
                  }@else if(player.gender.toLowerCase() === 'male'){
                    <i class="bi bi-gender-male me-1"></i>
                  }
                  {{player.gender | uppercase}}
                </span>
              </h6>
              <p class="card-text text-muted small mb-0" 
                 appCopyToClipboard="{{player.playerEmail}}"
                 copySuccessMessage="Email copied!" 
                 style="cursor: pointer;" 
                 title="Click to copy email">
                <i class="bi bi-envelope me-2"></i>{{player.playerEmail}}
                <i class="bi bi-copy ms-1"></i>
              </p>
              <div class="d-flex justify-content-between align-items-center">
                
                <small class="text-muted"><i class="bi bi-telephone-fill me-1"></i> {{player.mobileNumber}}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-shared-modal>
  `
})
export class UnassignedPlayersModalComponent {
  @Input() show = false;
  @Input() unassignedPlayers: IPlayerRegistration[] = [];
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}