import { Component, Input, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerRegistrationService } from '../../../../services/player-registration.service';
import { IPlayerRegistration, ITournament } from '../../../../models/group.model';
import { ConfirmationModalService } from '../../../../services';
import { PlayerRegistrationFormComponent } from '../../../../components';

@Component({
  selector: 'app-registration-users',
  imports: [CommonModule, PlayerRegistrationFormComponent],
  templateUrl: './registration-users.html',
  styleUrl: './registration-users.scss',
})
export class RegistrationUsersComponent implements OnInit {
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  registrations: IPlayerRegistration[] = [];
  loading = false;

  tournament = input.required<ITournament>();
  playerName = signal<string>('');
  playerEmail = signal<string>('');
  showModal = false;

  async ngOnInit() {
    const tournamentId = this.tournament()?.id;
    if (tournamentId) {
      await this.loadRegistrations(tournamentId);
    }
  }

  async loadRegistrations(tournamentId: string) {
    this.loading = true;
    try {
      this.registrations = await this.playerRegistrationService.getRegistrationsByTournament(
        tournamentId
      );
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      this.loading = false;
    }
  }

  async approveRegistration(registration: IPlayerRegistration) {
    if (!registration.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-hand-thumbs-up-fill"></i> Approve Registration',
      `<h5>Are you sure you want to approve this registration?</h5>`
    );
    if (!confirmed) return;
    try {
      await this.playerRegistrationService.updateRegistrationStatus(registration.id, 'approved');
      registration.status = 'approved';
    } catch (error) {
      console.error('Error approving registration:', error);
    }
  }

  async rejectRegistration(registration: IPlayerRegistration) {
    if (!registration.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-hand-thumbs-down-fill"></i> Reject Registration',
      `<h5>Are you sure you want to reject this registration?</h5>`
    );
    if (!confirmed) return;
    try {
      await this.playerRegistrationService.updateRegistrationStatus(registration.id, 'rejected');
      registration.status = 'rejected';
    } catch (error) {
      console.error('Error rejecting registration:', error);
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'approved':
        return 'bg-success text-light fw-normal';
      case 'rejected':
        return 'bg-danger text-light fw-normal';
      default:
        return 'bg-warning text-dark fw-normal';
    }
  }

  async deleteRegistration(registration: IPlayerRegistration) {
    if (!registration.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-trash3-fill"></i> Delete Registration',
      `<h5>Are you sure you want to delete this registration?</h5>`
    );
    if (!confirmed) return;
    try {
      await this.playerRegistrationService.deleteRegistration(registration.id);
      this.registrations = this.registrations.filter((r) => r.id !== registration.id);
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  }

  async onRegistrationSuccess() {
    this.resetForm();
    this.closeModal();
    this.ngOnInit();
  }

  resetForm() {
    this.playerName.set('');
    this.playerEmail.set('');
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  formatDate(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }
}
