import { Component, Input, Output, EventEmitter, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { PlayerRegistrationService } from '../../services/player-registration.service';
import { ValidationService } from '../../services/validation.service';
import { ITournament } from '../../models/group.model';

@Component({
  selector: 'app-player-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-registration-form.component.html',
  styleUrl: './player-registration-form.component.scss'
})
export class PlayerRegistrationFormComponent {
  @Input() tournament!: ITournament;
  @Input() showTournamentCard = true;
  @Output() registrationSuccess = new EventEmitter<void>();
  @Output() resetRequested = new EventEmitter<void>();
  
  playerName = model<string>('');
  playerEmail = model<string>('');
  playerGender = model<'male' | 'female' | 'other'>('male');
  playerMobile = model<string>('');

  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  validationService = inject(ValidationService);

  validationErrors: string[] = [];

  validateForm(): boolean {
    this.validationErrors = this.validationService.validatePlayerRegistration({
      playerName: this.playerName(),
      playerEmail: this.playerEmail(),
      mobileNumber: this.playerMobile(),
      gender: this.playerGender()
    });
    return this.validationErrors.length === 0;
  }

  async registerPlayer() {
    if (!this.tournament?.id) {
      this.confirmationModal.confirm('Error', 'Tournament information is missing.', true);
      return;
    }

    if (!this.validateForm()) {
      this.confirmationModal.confirm('Validation Error', this.validationErrors.join('\n'), true);
      return;
    }

    const id = this.loader.show();
    try {
      const isAlreadyRegistered = await this.playerRegistrationService.checkExistingRegistration(
        this.tournament.id,
        this.playerEmail().trim()
      );
      
      if (isAlreadyRegistered) {
        this.confirmationModal.confirm('Already Registered', 'You have already registered for this tournament.', true);
        return;
      }

      await this.playerRegistrationService.registerPlayer({
        tournamentId: this.tournament.id,
        playerName: this.playerName().trim(),
        playerEmail: this.playerEmail().trim(),
        gender: this.playerGender(),
        mobileNumber: this.playerMobile().trim(),
        registrationDate: new Date()
      });
      
      this.confirmationModal.confirm(
        'Success', 
        `Successfully registered for "${this.tournament.name}"!`, 
        true
      );
      this.registrationSuccess.emit();
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to register. Please try again.', true);
    } finally {
      this.loader.hide(id);
    }
  }

  formatDate(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }
}