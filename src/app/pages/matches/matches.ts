import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { ConfirmationModalService, MatchService, TeamService } from '../../services';
import { IKnockoutMatch, ITeam } from '../../models';

@Component({
  selector: 'matches',
  imports: [CommonModule, FormsModule, PopoverModule],
  templateUrl: './matches.html',
  styleUrl: './matches.scss'
})
export class MatchesComponent implements OnInit {
  @Input() tournamentId!: string;
  
  private matchService = inject(MatchService);
  private teamService = inject(TeamService);
  private confirmationModal = inject(ConfirmationModalService);
  
  matches: IKnockoutMatch[] = [];
  availableTeams: ITeam[] = [];
  loading = false;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showManageTeamsModal = false;
  
  // Form data
  matchForm = { round: 1, position: 1, scheduledDate: '', winnerId: '', status: 'pending' };
  selectedMatch: IKnockoutMatch | null = null;
  selectedTeams: string[] = [];

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [matches, teams] = await Promise.all([
        this.matchService.getMatchesByTournament(this.tournamentId),
        this.teamService.getTeamsByTournament(this.tournamentId)
      ]);
      
      this.matches = matches;
      this.availableTeams = teams;
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
    }
  }

  // Modal methods
  openCreateModal() {
    this.matchForm = { round: 1, position: 1, scheduledDate: '', winnerId: '', status: 'pending' };
    this.showCreateModal = true;
  }

  openEditModal(match: IKnockoutMatch) {
    this.selectedMatch = match;
    let dateString = '';
    if (match.scheduledDate) {
      try {
        let jsDate: Date;
        const dateObj = match.scheduledDate as any;
        if (dateObj.toDate && typeof dateObj.toDate === 'function') {
          // Firestore Timestamp
          jsDate = dateObj.toDate();
        } else if (match.scheduledDate instanceof Date) {
          jsDate = match.scheduledDate;
        } else {
          jsDate = new Date(match.scheduledDate);
        }
        if (!isNaN(jsDate.getTime())) {
          dateString = jsDate.toISOString().split('T')[0];
        }
      } catch (error) {
        console.warn('Invalid date format:', match.scheduledDate);
      }
    }
    this.matchForm = { 
      round: match.round, 
      position: match.position,
      scheduledDate: dateString,
      winnerId: match.winner?.id || '',
      status: match.status
    };
    this.showEditModal = true;
  }

  openManageTeamsModal(match: IKnockoutMatch) {
    this.selectedMatch = match;
    this.selectedTeams = [match.team1?.id, match.team2?.id].filter(Boolean) as string[];
    this.showManageTeamsModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showManageTeamsModal = false;
    this.selectedMatch = null;
    this.matchForm = { round: 1, position: 1, scheduledDate: '', winnerId: '', status: 'pending' };
    this.selectedTeams = [];
  }

  async createMatch() {
    if (!this.matchForm.round || !this.matchForm.position) return;
    
    try {
      await this.matchService.createMatch({
        tournamentId: this.tournamentId,
        round: this.matchForm.round,
        position: this.matchForm.position,
        status: 'pending',
        scheduledDate: this.matchForm.scheduledDate ? new Date(this.matchForm.scheduledDate) : undefined
      });
      
      this.closeModals();
      await this.loadData();
    } catch (error) {
      console.error('Error creating match:', error);
    }
  }

  async updateMatch() {
    if (!this.selectedMatch) return;
    
    const updateData: any = {
      round: this.matchForm.round,
      position: this.matchForm.position,
      status: this.matchForm.status as 'pending' | 'in-progress' | 'completed'
    };
    
    if (this.matchForm.scheduledDate) {
      updateData.scheduledDate = new Date(this.matchForm.scheduledDate);
    }
    
    if (this.matchForm.winnerId) {
      updateData.winner = this.availableTeams.find(t => t.id === this.matchForm.winnerId);
    }
    
    try {
      await this.matchService.updateMatch(this.selectedMatch.id!, updateData);
      this.closeModals();
      await this.loadData();
    } catch (error) {
      console.error('Error updating match:', error);
    }
  }

  async deleteMatch(matchId: string) {
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-trash3-fill"></i> Delete Match Confirmation',
      `<h5>Are you sure you want to delete this match?</h5>`
    );
    if (confirmed) {
      try {
        await this.matchService.deleteMatch(matchId);
        await this.loadData();
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  }

  async saveMatchTeams() {
    if (!this.selectedMatch) return;
    
    const [team1Id, team2Id] = this.selectedTeams;
    const team1 = this.availableTeams.find(t => t.id === team1Id);
    const team2 = this.availableTeams.find(t => t.id === team2Id);
    
    try {
      await this.matchService.updateMatch(this.selectedMatch.id!, { 
        team1: team1 || undefined,
        team2: team2 || undefined
      });
      this.closeModals();
      await this.loadData();
    } catch (error) {
      console.error('Error updating match teams:', error);
    }
  }

  toggleTeamSelection(teamId: string) {
    const index = this.selectedTeams.indexOf(teamId);
    if (index > -1) {
      this.selectedTeams.splice(index, 1);
    } else if (this.selectedTeams.length < 2) {
      this.selectedTeams.push(teamId);
    }
  }

  isTeamSelected(teamId: string): boolean {
    return this.selectedTeams.includes(teamId);
  }

  getAvailableTeamsForMatch(): ITeam[] {
    if (!this.selectedMatch) return this.availableTeams;
    
    const otherMatchTeamIds = this.matches
      .filter(match => match.id !== this.selectedMatch!.id)
      .flatMap(match => [match.team1?.id, match.team2?.id])
      .filter(Boolean) as string[];
    
    return this.availableTeams.filter(team => !otherMatchTeamIds.includes(team.id!));
  }

  async setWinner(match: IKnockoutMatch, teamId: string) {
    const winner = this.availableTeams.find(t => t.id === teamId);
    
    try {
      await this.matchService.updateMatch(match.id!, { 
        winner,
        status: 'completed'
      });
      await this.loadData();
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  }

  getMatchTeams(match: IKnockoutMatch): { team1: ITeam | undefined, team2: ITeam | undefined } {
    return {
      team1: match.team1,
      team2: match.team2
    };
  }

  getTeamNameById(teamId: string): string {
    return this.availableTeams.find(t => t.id === teamId)?.name || 'Unknown';
  }

  getMatchTeamsForEdit(): ITeam[] {
    if (!this.selectedMatch) return [];
    return [this.selectedMatch.team1, this.selectedMatch.team2].filter(Boolean) as ITeam[];
  }

  getFormattedDate(date: any): string {
    if (!date) return '';
    try {
      let jsDate: Date;
      if (date.toDate && typeof date.toDate === 'function') {
        // Firestore Timestamp
        jsDate = date.toDate();
      } else if (date instanceof Date) {
        jsDate = date;
      } else {
        jsDate = new Date(date);
      }
      return jsDate.toLocaleDateString(); // + ' ' + jsDate.toLocaleTimeString();
    } catch (error) {
      return 'Invalid Date';
    }
  }
}