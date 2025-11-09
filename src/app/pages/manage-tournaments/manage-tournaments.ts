import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { TournamentService } from '../../services/tournament.service';
import { TournamentModalService } from '../../services/tournament-modal.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';
import { ITournament } from '../../models/group.model';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CopyToClipboardDirective } from '../../directives';
import { SharedLayoutComponent, QrCodeModalComponent } from '../../components';

@Component({
  selector: 'app-manage-tournaments',
  imports: [CommonModule, PopoverModule, CopyToClipboardDirective, SharedLayoutComponent, QrCodeModalComponent],
  templateUrl: './manage-tournaments.html',
  styleUrl: './manage-tournaments.scss',
})
export class ManageTournaments {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(TournamentService);
  private tournamentModal = inject(TournamentModalService);
  private userService = inject(UserService);
  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);
  
  user$ = this.userService.user$;
  tournaments$!: Observable<ITournament[]>;
  groupId = this.route.snapshot.params['groupId'];
  showQRPopover: string | null = null;
  selectedTournament: ITournament | null = null;
  
  headerActions = [
    {
      label: 'Back to Groups',
      icon: 'bi-arrow-left',
      handler: () => this.goBack()
    },
    {
      label: 'Create Tournament',
      icon: 'bi-plus-lg',
      handler: () => this.openAddModal()
    }
  ];

  constructor() {
    if (!this.groupId) {
      this.router.navigate(['/groups']);
      return;
    }
    this.tournaments$ = this.tournamentService.getTournaments(this.groupId);
  }

  async openAddModal() {
    const result = await this.tournamentModal.openAddModal();
    if (!result || !result.name || !result.startDate || !result.sport || !result.description) return;
    
    const user = await firstValueFrom(this.user$);
    if (!user?.email) return;
    
    const id = this.loader.show();
    try {
      await this.tournamentService.createTournament({
        ...result,
        groupId: this.groupId
      } as ITournament, user.email);
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to create tournament. Please try again.', true);
    } finally {
      this.loader.hide(id);
    }
  }

  async openEditModal(tournament: ITournament) {
    const result = await this.tournamentModal.openEditModal(tournament);
    if (!result || !tournament.id) return;
    
    const user = await firstValueFrom(this.user$);
    if (!user?.email) return;
    
    const id = this.loader.show();
    try {
      await this.tournamentService.updateTournament(tournament.id, result, user.email);
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to update tournament. Please try again.', true);
    } finally {
      this.loader.hide(id);
    }
  }

  async delete(tournament: ITournament) {
    if (!tournament.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-trash3-fill"></i> Delete Tournament',
      `<h5>Are you sure you want to delete "${tournament.name}"?</h5>`
    );
    if (!confirmed) return;
    
    const id = this.loader.show();
    try {
      await this.tournamentService.deleteTournament(tournament.id);
    } catch (error) {
      this.confirmationModal.confirm('Error', 'Failed to delete tournament. Please try again.', true);
    } finally {
      this.loader.hide(id);
    }
  }

  goBack() {
    this.router.navigate(['/groups']);
  }

  formatDateForDisplay(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  showQRCode(tournament: ITournament) {
    this.selectedTournament = tournament;
    this.showQRPopover = tournament.id!;
  }

  hideQRCode() {
    this.selectedTournament = null;
    this.showQRPopover = null;
  }

  configureTournament(tournamentId: string) {
    this.router.navigate(['/planner', this.groupId, tournamentId, 'info']);
  }
}