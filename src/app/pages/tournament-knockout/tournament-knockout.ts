import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ITeam, IKnockoutMatch, IKnockoutTournament } from '../../models/group.model';
import { TeamService } from '../../services/team.service';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-tournament-knockout',
  standalone: true,
  imports: [CommonModule, PopoverModule, TabsModule],
  templateUrl: './tournament-knockout.html',
  styleUrl: './tournament-knockout.scss'
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
  isLoading = true;

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
    this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
    this.loadTeams();
  }

  async loadTeams() {
    try {
      this.isLoading = true;
      this.teams = await this.teamService.getTeamsByTournament(this.tournamentId);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      this.isLoading = false;
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
    return count >= 2 && this.isPowerOfTwo(count);
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  generateBracket() {
    if (!this.canGenerateBracket()) return;

    this.isGenerating = true;
    
    setTimeout(() => {
      const shuffledTeams = this.shuffleArray([...this.selectedTeams]);
      const totalTeams = shuffledTeams.length;
      const totalRounds = Math.log2(totalTeams);
      const matches: IKnockoutMatch[] = [];

      // Generate first round matches
      for (let i = 0; i < totalTeams / 2; i++) {
        matches.push({
          id: `match-1-${i + 1}`,
          round: 1,
          position: i,
          team1: shuffledTeams[i * 2],
          team2: shuffledTeams[i * 2 + 1],
          status: 'pending'
        });
      }

      // Generate subsequent rounds
      for (let round = 2; round <= totalRounds; round++) {
        const matchesInRound = Math.pow(2, totalRounds - round);
        for (let i = 0; i < matchesInRound; i++) {
          matches.push({
            id: `match-${round}-${i + 1}`,
            round,
            position: i,
            status: 'pending'
          });
        }
      }

      this.knockoutTournament = {
        tournamentId: this.tournamentId,
        teams: [...shuffledTeams],
        matches,
        totalRounds,
        currentRound: 1,
        status: 'draft'
      };

      this.isGenerating = false;
    }, 800);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  advanceWinner(match: IKnockoutMatch, winner: ITeam) {
    if (!this.knockoutTournament || match.status === 'completed') return;

    match.winner = winner;
    match.status = 'completed';

    // Find and update next match
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

    // Check if tournament is complete
    this.checkTournamentCompletion();
  }

  private checkTournamentCompletion() {
    if (!this.knockoutTournament) return;
    
    const finalMatch = this.knockoutTournament.matches.find(
      m => m.round === this.knockoutTournament!.totalRounds
    );
    
    if (finalMatch?.winner) {
      this.knockoutTournament.status = 'completed';
    }
  }

  resetBracket() {
    this.knockoutTournament = null;
    this.selectedTeams = [];
  }

  getMatchesByRound(round: number): IKnockoutMatch[] {
    if (!this.knockoutTournament) return [];
    return this.knockoutTournament.matches
      .filter(m => m.round === round)
      .sort((a, b) => a.position - b.position);
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
    if (round === 1) return 'First Round';
    return `Round ${round}`;
  }

  getNextPowerOf2(num: number): number {
    if (num <= 0) return 2;
    return Math.pow(2, Math.ceil(Math.log2(num)));
  }

  getTeamsNeeded(): number {
    if (this.selectedTeams.length === 0) return 2;
    return this.getNextPowerOf2(this.selectedTeams.length) - this.selectedTeams.length;
  }

  getChampion(): ITeam | null {
    if (!this.knockoutTournament) return null;
    
    const finalMatch = this.knockoutTournament.matches.find(
      m => m.round === this.knockoutTournament!.totalRounds
    );
    
    return finalMatch?.winner || null;
  }

  getCompletedMatchesCount(round: number): number {
    return this.getMatchesByRound(round).filter(m => m.status === 'completed').length;
  }

  goBack() {
    this.router.navigate(['/tournament-config', this.groupId, this.tournamentId, 'teams']);
  }
}