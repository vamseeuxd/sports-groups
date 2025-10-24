import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { PlayerRegistrationService } from '../../services/player-registration.service';
import { ITournament } from '../../models/group.model';

@Component({
  selector: 'app-player-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './player-registration.html',
  styleUrl: './player-registration.scss'
})
export class PlayerRegistration {
  private router = inject(Router);
  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);

  showScanner = true;
  tournament: ITournament | null = null;
  playerName = '';
  playerEmail = '';
  scannerEnabled = true;
  allowedFormats = [BarcodeFormat.QR_CODE];

  async onCodeResult(result: string) {
    if (!result) return;
    
    this.scannerEnabled = false;
    const id = this.loader.show();
    
    try {
      this.tournament = await this.playerRegistrationService.getTournamentById(result);
      if (this.tournament) {
        this.showScanner = false;
      } else {
        this.confirmationModal.confirm('Error', 'Tournament not found. Please scan a valid QR code.', true);
        this.scannerEnabled = true;
      }
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to load tournament details.', true);
      this.scannerEnabled = true;
    } finally {
      this.loader.hide(id);
    }
  }

  async registerPlayer() {
    if (!this.tournament?.id || !this.playerName.trim() || !this.playerEmail.trim()) {
      this.confirmationModal.confirm('Error', 'Please fill in all required fields.', true);
      return;
    }

    const id = this.loader.show();
    try {
      await this.playerRegistrationService.registerPlayer({
        tournamentId: this.tournament.id,
        playerName: this.playerName.trim(),
        playerEmail: this.playerEmail.trim(),
        registrationDate: new Date()
      });
      
      this.confirmationModal.confirm(
        'Success', 
        `Successfully registered for "${this.tournament.name}"!`, 
        true
      );
      this.resetForm();
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to register. Please try again.', true);
    } finally {
      this.loader.hide(id);
    }
  }

  resetForm() {
    this.tournament = null;
    this.playerName = '';
    this.playerEmail = '';
    this.showScanner = true;
    this.scannerEnabled = true;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatDate(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }
}