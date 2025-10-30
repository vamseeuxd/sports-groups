import { Component, Input, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerRegistrationService } from '../../../../services/player-registration.service';
import { ValidationService } from '../../../../services/validation.service';
import { LoaderService } from '../../../../services/loader.service';
import { IPlayerRegistration, ITournament } from '../../../../models/group.model';
import { ConfirmationModalService } from '../../../../services';
import { PlayerRegistrationFormComponent } from '../../../../components';
import { PopoverModule } from 'ngx-bootstrap/popover';

@Component({
  selector: 'app-registration-users',
  imports: [CommonModule, FormsModule, PlayerRegistrationFormComponent, PopoverModule],
  templateUrl: './registration-users.html',
  styleUrl: './registration-users.scss',
})
export class RegistrationUsersComponent implements OnInit {
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  private validationService = inject(ValidationService);
  private loader = inject(LoaderService);
  registrations: IPlayerRegistration[] = [];
  loading = false;

  tournament = input.required<ITournament>();
  playerName = signal<string>('');
  playerEmail = signal<string>('');
  showModal = false;
  showBulkModal = false;
  showEditModal = false;
  editingPlayer: IPlayerRegistration | null = null;
  csvData: any[] = [];
  csvErrors: string[] = [];
  uploading = false;

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
    
    const id = this.loader.show();
    try {
      await this.playerRegistrationService.updateRegistrationStatus(registration.id, 'approved');
      registration.status = 'approved';
    } catch (error) {
      console.error('Error approving registration:', error);
    } finally {
      this.loader.hide(id);
    }
  }

  async rejectRegistration(registration: IPlayerRegistration) {
    if (!registration.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-hand-thumbs-down-fill"></i> Reject Registration',
      `<h5>Are you sure you want to reject this registration?</h5>`
    );
    if (!confirmed) return;
    
    const id = this.loader.show();
    try {
      await this.playerRegistrationService.updateRegistrationStatus(registration.id, 'rejected');
      registration.status = 'rejected';
    } catch (error) {
      console.error('Error rejecting registration:', error);
    } finally {
      this.loader.hide(id);
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
    
    const id = this.loader.show();
    try {
      await this.playerRegistrationService.deleteRegistration(registration.id);
      this.registrations = this.registrations.filter((r) => r.id !== registration.id);
    } catch (error) {
      console.error('Error deleting registration:', error);
    } finally {
      this.loader.hide(id);
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      this.csvErrors = ['Please select a CSV file'];
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      this.processCsvFile(csvText);
    };
    reader.readAsText(file);
  }

  processCsvFile(csvText: string) {
    try {
      const parsedData = this.validationService.parseCSV(csvText);
      const validation = this.validationService.validateCSVData(parsedData);
      
      this.csvErrors = validation.errors;
      this.csvData = validation.validRows;
    } catch (error) {
      this.csvErrors = ['Error parsing CSV file. Please check the format.'];
      this.csvData = [];
    }
  }

  async uploadPlayers() {
    if (this.csvData.length === 0 || !this.tournament()?.id) return;
    
    const id = this.loader.show();
    this.uploading = true;
    try {
      const result = await this.playerRegistrationService.bulkRegisterPlayers(
        this.tournament().id!,
        this.csvData
      );
      
      let message = `Successfully registered ${result.success} players.`;
      if (result.failed > 0) {
        message += `\n${result.failed} failed registrations.`;
        if (result.errors.length > 0) {
          message += `\nErrors:\n${result.errors.join('\n')}`;
        }
      }
      
      this.confirmationModal.confirm('Upload Complete', message, true);
      this.closeBulkModal();
      await this.ngOnInit();
    } catch (error) {
      this.confirmationModal.confirm('Upload Failed', 'Failed to upload players. Please try again.', true);
    } finally {
      this.uploading = false;
      this.loader.hide(id);
    }
  }

  closeBulkModal() {
    this.showBulkModal = false;
    this.csvData = [];
    this.csvErrors = [];
  }

  editPlayer(registration: IPlayerRegistration) {
    this.editingPlayer = { ...registration };
    this.showEditModal = true;
  }

  async updatePlayer() {
    if (!this.editingPlayer?.id) return;
    
    const id = this.loader.show();
    try {
      await this.playerRegistrationService.updatePlayerRegistration(this.editingPlayer.id, {
        playerName: this.editingPlayer.playerName,
        playerEmail: this.editingPlayer.playerEmail,
        gender: this.editingPlayer.gender,
        mobileNumber: this.editingPlayer.mobileNumber
      });
      
      const index = this.registrations.findIndex(r => r.id === this.editingPlayer!.id);
      if (index !== -1) {
        this.registrations[index] = { ...this.editingPlayer };
      }
      
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating player:', error);
    } finally {
      this.loader.hide(id);
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingPlayer = null;
  }

  downloadSampleCSV() {
    const csvContent = `playerName,playerEmail,gender,mobileNumber
John Smith,john.smith@email.com,male,+1234567890
Jane Doe,jane.doe@email.com,female,9876543210
Mike Johnson,mike.johnson@email.com,male,5551234567
Sarah Wilson,sarah.wilson@email.com,female,+447123456789
Alex Chen,alex.chen@email.com,other,1234567890`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-players.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
