import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { TeamService } from '../../services';
import { PlayerRegistrationService } from '../../services/player-registration.service';
import { IPlayerRegistration, ITeam, ITeamPlayer } from '../../models';
import { SharedLayoutComponent, CreateTeamModalComponent, EditTeamModalComponent, ManagePlayersModalComponent, UnassignedPlayersModalComponent } from '../../components';

@Component({
  selector: 'teams',
  imports: [CommonModule, FormsModule, PopoverModule, SharedLayoutComponent, CreateTeamModalComponent, EditTeamModalComponent, ManagePlayersModalComponent, UnassignedPlayersModalComponent],
  templateUrl: './teams.html',
  styleUrl: './teams.scss'
})
export class TeamsComponent implements OnInit {
  @Input() tournamentId!: string;
  
  private teamService = inject(TeamService);
  private playerService = inject(PlayerRegistrationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  teams: ITeam[] = [];
  availablePlayers: IPlayerRegistration[] = [];
  loading = false;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showManagePlayersModal = false;
  showUnassignedPlayersModal = false;
  
  // Form data
  teamForm = { name: '' };
  selectedTeam: ITeam | null = null;
  selectedPlayers: string[] = [];
  
  headerActions = [
    {
      label: 'Refresh Tournament',
      icon: 'bi-arrow-clockwise',
      handler: () => this.loadData()
    },
    {
      label: 'Create Team',
      icon: 'bi-plus-lg',
      handler: () => this.openCreateModal()
    }
  ];

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [teams, registrations] = await Promise.all([
        this.teamService.getTeamsByTournament(this.tournamentId),
        this.playerService.getRegistrationsByTournament(this.tournamentId)
      ]);
      
      this.teams = teams;
      this.availablePlayers = registrations.filter((p: IPlayerRegistration) => p.status === 'approved');
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
    }
  }

  // Modal methods
  openCreateModal() {
    this.teamForm = { name: '' };
    this.showCreateModal = true;
  }

  openEditModal(team: ITeam) {
    this.selectedTeam = team;
    this.teamForm = { name: team.name };
    this.showEditModal = true;
  }

  openManagePlayersModal(team: ITeam) {
    this.selectedTeam = team;
    this.selectedPlayers = [...team.playerIds];
    this.showManagePlayersModal = true;
  }

  openUnassignedPlayersModal() {
    this.showUnassignedPlayersModal = true;
  }

  closeUnassignedPlayersModal() {
    this.showUnassignedPlayersModal = false;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showManagePlayersModal = false;
    this.showUnassignedPlayersModal = false;
    this.selectedTeam = null;
    this.teamForm = { name: '' };
    this.selectedPlayers = [];
  }

  isTeamNameTaken(name: string, excludeTeamId?: string): boolean {
    return this.teams.some(team => 
      team.name.toLowerCase() === name.toLowerCase() && team.id !== excludeTeamId
    );
  }

  async createTeam(teamName: string) {
    try {
      await this.teamService.createTeam({
        name: teamName,
        tournamentId: this.tournamentId,
        playerIds: []
      });
      
      await this.loadData();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  }

  async updateTeam(teamName: string) {
    if (!this.selectedTeam) return;
    
    try {
      await this.teamService.updateTeam(this.selectedTeam.id!, { name: teamName });
      await this.loadData();
    } catch (error) {
      console.error('Error updating team:', error);
    }
  }

  async deleteTeam(teamId: string) {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await this.teamService.deleteTeam(teamId);
        await this.loadData();
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  }

  async saveTeamPlayers(data: {playerIds: string[], captainId?: string}) {
    if (!this.selectedTeam) return;
    
    try {
      const updateData: any = { playerIds: data.playerIds };
      if (data.captainId) {
        updateData.captainId = data.captainId;
      }
      await this.teamService.updateTeam(this.selectedTeam.id!, updateData);
      await this.loadData();
    } catch (error) {
      console.error('Error updating team players:', error);
    }
  }

  togglePlayerSelection(playerId: string) {
    const index = this.selectedPlayers.indexOf(playerId);
    if (index > -1) {
      this.selectedPlayers.splice(index, 1);
    } else {
      this.selectedPlayers.push(playerId);
    }
  }

  isPlayerSelected(playerId: string): boolean {
    return this.selectedPlayers.includes(playerId);
  }

  getTeamPlayers(team: ITeam): ITeamPlayer[] {
    return team.playerIds.map((playerId: string) => {
      const player = this.availablePlayers.find((p: IPlayerRegistration) => p.id === playerId);
      return {
        id: playerId,
        playerName: player?.playerName || 'Unknown',
        playerEmail: player?.playerEmail || '',
        isCaptain: team.captainId === playerId
      };
    }).filter((p: ITeamPlayer) => p.playerName !== 'Unknown');
  }

  getSortedTeamPlayers(team: ITeam): ITeamPlayer[] {
    const players = this.getTeamPlayers(team);
    return players.sort((a, b) => {
      if (a.isCaptain && !b.isCaptain) return -1;
      if (!a.isCaptain && b.isCaptain) return 1;
      return 0;
    });
  }

  getUnassignedPlayers(): IPlayerRegistration[] {
    const assignedPlayerIds = this.teams.flatMap((team: ITeam) => team.playerIds);
    return this.availablePlayers.filter((player: IPlayerRegistration) => !assignedPlayerIds.includes(player.id!));
  }

  getAvailablePlayersForTeam(): IPlayerRegistration[] {
    if (!this.selectedTeam) return this.availablePlayers;
    
    const otherTeamPlayerIds = this.teams
      .filter(team => team.id !== this.selectedTeam!.id)
      .flatMap(team => team.playerIds);
    
    return this.availablePlayers.filter(player => !otherTeamPlayerIds.includes(player.id!));
  }

  getPlayerNameById(playerId: string): string {
    return this.availablePlayers.find(p => p.id === playerId)?.playerName || 'Unknown';
  }

  async setCaptain(playerId: string) {
    if (!this.selectedTeam) return;
    
    try {
      await this.teamService.updateTeam(this.selectedTeam.id!, { captainId: playerId });
      await this.loadData();
    } catch (error) {
      console.error('Error setting captain:', error);
    }
  }
}