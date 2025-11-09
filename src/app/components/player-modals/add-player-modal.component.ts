import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { PlayerRegistrationFormComponent } from '../player-registration-form/player-registration-form.component';
import { ITournament } from '../../models';

@Component({
  selector: 'app-add-player-modal',
  standalone: true,
  imports: [CommonModule, SharedModalComponent, PlayerRegistrationFormComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="New Player Registration"
      icon="bi-person-plus"
      [showFooter]="false"
      (closed)="close()">
      
      <app-player-registration-form
        [tournament]="tournament"
        [(playerName)]="playerName"
        [showTournamentCard]="false"
        [(playerEmail)]="playerEmail"
        (registrationSuccess)="onSuccess()"
        (resetRequested)="close()"
      />
    </app-shared-modal>
  `
})
export class AddPlayerModalComponent {
  @Input() show = false;
  @Input() tournament!: ITournament;
  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  playerName = signal<string>('');
  playerEmail = signal<string>('');

  onSuccess() {
    this.success.emit();
    this.close();
  }

  close() {
    this.playerName.set('');
    this.playerEmail.set('');
    this.closed.emit();
  }
}