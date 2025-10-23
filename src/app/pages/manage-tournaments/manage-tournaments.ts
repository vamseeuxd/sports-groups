import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { TournamentService } from '../../services/tournament.service';
import { TournamentModalService } from '../../services/tournament-modal.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';
import { ITournament, SPORTS_OPTIONS } from '../../models/group.model';

@Component({
  selector: 'app-manage-tournaments',
  imports: [CommonModule],
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
  editingId: string | null = null;
  sportsOptions = SPORTS_OPTIONS;

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
      `Are you sure you want to delete "${tournament.name}"?`
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

  startEdit(tournamentId: string) {
    this.editingId = tournamentId;
  }

  cancelEdit() {
    this.editingId = null;
  }

  goBack() {
    this.router.navigate(['/groups']);
  }

  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  formatDateForDisplay(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }
}