import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { PlayerRegistrationService } from '../../services/player-registration.service';
import { ITournament } from '../../models/group.model';
import { UserService } from '../../services';
import { PlayerRegistrationFormComponent } from '../../components';

@Component({
  selector: 'app-player-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule, PlayerRegistrationFormComponent],
  templateUrl: './player-registration.html',
  styleUrl: './player-registration.scss'
})
export class PlayerRegistration implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  private userService = inject(UserService);
  user$ = this.userService.user$;
  private userSubscription?: Subscription;

  showOptions = true;
  showScanner = false;
  showManualEntry = false;
  tournament: ITournament | null = null;
  playerName = '';
  playerEmail = '';
  playerGender: 'male' | 'female' | 'other' = 'male';
  playerMobile = '';
  manualTournamentId = '';
  scannerEnabled = true;
  allowedFormats = [BarcodeFormat.QR_CODE];

  ngOnInit() {
    const tournamentId = this.route.snapshot.paramMap.get('tournamentId');
    if (tournamentId) {
      this.loadTournamentFromRoute(tournamentId);
    }
    this.userSubscription = this.user$.subscribe(user => {
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

  onRegistrationSuccess() {
    this.resetForm();
  }

  resetForm() {
    this.tournament = null;
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

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}