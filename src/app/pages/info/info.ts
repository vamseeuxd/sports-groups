import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom, map } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { TournamentService } from '../../services/tournament.service';
import { ITournament } from '../../models';
import { SharedLayoutComponent } from '../../components';
import { TournamentModalService } from '../../services/tournament-modal.service';
import { ConfirmationModalService, LoaderService, UserService } from '../../services';

@Component({
  selector: 'info',
  imports: [CommonModule, SharedLayoutComponent],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class InfoComponent implements OnInit {
  @Input() tournamentId!: string;

  private tournamentService = inject(TournamentService);
  tournament$!: Observable<ITournament>;
  private tournamentModal = inject(TournamentModalService);
  private userService = inject(UserService);
  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);

  user$ = this.userService.user$;

  headerActions = [
    {
      label: 'Edit Tournament',
      icon: 'bi-pencil-fill',
      handler: () => this.editTournament(),
    },
  ];

  ngOnInit() {
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId);
  }
  
  formatDateForDisplay(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Could add a toast notification here
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  async editTournament() {
    // TODO: Implement edit tournament functionality
    console.log('Edit tournament:', this.tournamentId);
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId);
    const tournament = await firstValueFrom(this.tournament$);
    if (!tournament) return;
    const result = await this.tournamentModal.openEditModal(tournament);
    if (!result || !tournament.id) return;

    const user = await firstValueFrom(this.user$);
    if (!user?.email) return;

    const id = this.loader.show();
    try {
      await this.tournamentService.updateTournament(tournament.id, result, user.email);
    } catch (error) {
      this.confirmationModal.confirm(
        'Error',
        'Failed to update tournament. Please try again.',
        true
      );
    } finally {
      this.loader.hide(id);
    }
  }
}
