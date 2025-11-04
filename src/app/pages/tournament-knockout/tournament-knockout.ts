import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ITeam, IKnockoutMatch, IKnockoutTournament } from '../../models';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-tournament-knockout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tournament-knockout.html',
  styleUrls: ['./tournament-knockout.scss']
})
export class TournamentKnockout implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);

  tournamentId = '';
  groupId = '';
  teams: ITeam[] = [];
  knockoutTournament: IKnockoutTournament | null = null;
  selectedTeams: ITeam[] = [];
  isGenerating = false;

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
    this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
    this.loadTeams();
  }

  async loadTeams() {
    try {
      this.teams = await this.teamService.getTeamsByTournament(this.tournamentId);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }

  toggleTeamSelection(team: ITeam) {
    const index = this.selectedTeams.findIndex(t => t.id === team.id);
    if (index > -1) {
      this.selectedTeams.splice(index, 1);
    } else {
      this.selectedTeams.push(team);
    }
  }

  isTeamSelected(team: ITeam): boolean {
    return this.selectedTeams.some(t => t.id === team.id);
  }

  canGenerateBracket(): boolean {
    const count = this.selectedTeams.length;
    return count >= 2 && (count & (count - 1)) === 0; // Power of 2
  }

  generateBracket() {
    if (!this.canGenerateBracket()) return;

    this.isGenerating = true;
    const totalTeams = this.selectedTeams.length;
    const totalRounds = Math.log2(totalTeams);
    const matches: IKnockoutMatch[] = [];

    // Generate first round matches
    for (let i = 0; i < totalTeams / 2; i++) {
      matches.push({
        id: `match-1-${i}`,
        round: 1,
        position: i,
        team1: this.selectedTeams[i * 2],
        team2: this.selectedTeams[i * 2 + 1],
        status: 'pending'
      });
    }

    // Generate subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `match-${round}-${i}`,
          round,
          position: i,
          status: 'pending'
        });
      }
    }

    this.knockoutTournament = {
      tournamentId: this.tournamentId,
      teams: [...this.selectedTeams],
      matches,
      totalRounds,
      currentRound: 1,
      status: 'draft'
    };

    this.isGenerating = false;
  }

  advanceWinner(match: IKnockoutMatch, winner: ITeam) {
    if (!this.knockoutTournament) return;

    match.winner = winner;
    match.status = 'completed';

    // Find next match
    const nextRound = match.round + 1;
    const nextPosition = Math.floor(match.position / 2);
    const nextMatch = this.knockoutTournament.matches.find(
      m => m.round === nextRound && m.position === nextPosition
    );

    if (nextMatch) {
      if (match.position % 2 === 0) {
        nextMatch.team1 = winner;
      } else {
        nextMatch.team2 = winner;
      }
    }
  }

  resetBracket() {
    this.knockoutTournament = null;
    this.selectedTeams = [];
  }

  getMatchesByRound(round: number): IKnockoutMatch[] {
    if (!this.knockoutTournament) return [];
    return this.knockoutTournament.matches.filter(m => m.round === round);
  }

  getRounds(): number[] {
    if (!this.knockoutTournament) return [];
    return Array.from({ length: this.knockoutTournament.totalRounds }, (_, i) => i + 1);
  }

  getRoundName(round: number): string {
    if (!this.knockoutTournament) return '';
    const totalRounds = this.knockoutTournament.totalRounds;
    
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  }

  getNextPowerOf2(num: number): number {
    return Math.pow(2, Math.ceil(Math.log2(num)));
  }

  getMatchMarginTop(round: number, matchIndex: number): number {
    const baseMargin = 20;
    const multiplier = Math.pow(2, round - 1);
    return baseMargin * multiplier * matchIndex;
  }

  goBack() {
    this.router.navigate(['/tournament-config', this.groupId, this.tournamentId, 'teams']);
  }
}