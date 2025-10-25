import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournament-teams',
  imports: [CommonModule],
  templateUrl: './tournament-teams.html',
  styleUrl: './tournament-teams.scss'
})
export class TournamentTeamsComponent {
  @Input() tournamentId!: string;
}