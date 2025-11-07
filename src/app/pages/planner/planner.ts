import { Component, inject, input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TournamentService } from '../../services/tournament.service';
import { ITournament } from '../../models/group.model';
import { InfoComponent } from '../info/info';
import { TeamsComponent } from '../teams/teams';
import { PlayersComponent } from '../players/players';
import { MatchesComponent } from '../matches/matches';

@Component({
  selector: 'planner',
  imports: [
    CommonModule,
    InfoComponent,
    TeamsComponent,
    PlayersComponent,
    MatchesComponent,
  ],
  templateUrl: './planner.html',
  styleUrl: './planner.scss'
})
export class PlannerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(TournamentService);

  tournamentId = input.required<string>();
  tournament$!: Observable<ITournament>;
  activeTab = input.required<string>();

  ngOnInit() {
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId());
  }

  setActiveTab(tab: string) {
    // this.activeTab = tab;
    this.router.navigate(['/planner', this.route.snapshot.params['groupId'], this.tournamentId(), tab]);
  }

  goBack() {
    const groupId = this.route.snapshot.params['groupId'];
    this.router.navigate(['/manage-tournaments', groupId]);
  }
}