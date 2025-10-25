import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerRegistrationService } from '../../../../services/player-registration.service';
import { IPlayerRegistration } from '../../../../models/group.model';
import { ConfirmationModalService } from '../../../../services';

@Component({
  selector: 'app-registration-users',
  imports: [CommonModule],
  templateUrl: './registration-users.html',
  styleUrl: './registration-users.scss',
})
export class RegistrationUsersComponent implements OnInit {
  @Input() tournamentId!: string;
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  registrations: IPlayerRegistration[] = [];
  loading = false;

  async ngOnInit() {
    await this.loadRegistrations();
  }

  async loadRegistrations() {
    this.loading = true;
    try {
      this.registrations = await this.playerRegistrationService.getRegistrationsByTournament(
        this.tournamentId
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
}
