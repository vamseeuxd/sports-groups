import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { PlayerRegistrationService } from '../../services/player-registration.service';
import { ITournament } from '../../models/group.model';
import { UserService } from '../../services';

@Component({
  selector: 'app-player-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './player-registration.html',
  styleUrl: './player-registration.scss'
})
export class PlayerRegistration implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  private userService = inject(UserService);
  user$ = this.userService.user$;

  showOptions = true;
  showScanner = false;
  showManualEntry = false;
  tournament: ITournament | null = null;
  playerName = '';
  playerEmail = '';
  manualTournamentId = '';
  scannerEnabled = true;
  allowedFormats = [BarcodeFormat.QR_CODE];

  ngOnInit() {
    const tournamentId = this.route.snapshot.paramMap.get('tournamentId');
    if (tournamentId) {
      this.loadTournamentFromRoute(tournamentId);
    }
    this.user$.subscribe(user => {
      if (user) {
        this.playerName = user.displayName || '';
        this.playerEmail = user.email || '';
      }
    });
  }

  selectOption(option: string) {
    this.showOptions = false;
    if (option === 'scan') {
      this.showScanner = true;
      this.scannerEnabled = true;
    } else if (option === 'manual') {
      this.showManualEntry = true;
    }
  }

  async loadTournamentFromRoute(tournamentId: string) {
    this.showOptions = false;
    const id = this.loader.show();
    try {
      this.tournament = await this.playerRegistrationService.getTournamentById(tournamentId);
      if (!this.tournament) {
        this.confirmationModal.confirm('Error', 'Tournament not found.', true);
        this.showOptions = true;
      }
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to load tournament.', true);
      this.showOptions = true;
    } finally {
      this.loader.hide(id);
    }
  }

  async loadTournamentManually() {
    if (!this.manualTournamentId.trim()) return;
    
    const id = this.loader.show();
    try {
      this.tournament = await this.playerRegistrationService.getTournamentById(this.manualTournamentId.trim());
      if (this.tournament) {
        this.showManualEntry = false;
      } else {
        this.confirmationModal.confirm('Error', 'Tournament not found. Please check the ID.', true);
      }
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to load tournament.', true);
    } finally {
      this.loader.hide(id);
    }
  }

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
      const isAlreadyRegistered = await this.playerRegistrationService.checkExistingRegistration(
        this.tournament.id,
        this.playerEmail.trim()
      );
      
      if (isAlreadyRegistered) {
        this.confirmationModal.confirm('Already Registered', 'You have already registered for this tournament.', true);
        return;
      }

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
    /* this.playerName = '';
    this.playerEmail = ''; */
    this.manualTournamentId = '';
    this.showOptions = true;
    this.showScanner = false;
    this.showManualEntry = false;
    this.scannerEnabled = true;
  }

  backToOptions() {
    this.showOptions = true;
    this.showScanner = false;
    this.showManualEntry = false;
    this.scannerEnabled = false;
  }

  goBack() {
    this.router.navigate(['../groups']);
  }

  formatDate(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }
}