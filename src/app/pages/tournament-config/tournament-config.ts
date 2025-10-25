import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TournamentService } from '../../services/tournament.service';
import { ITournament } from '../../models/group.model';
import { TournamentInfoComponent } from './components/tournament-info/tournament-info';
import { TournamentTeamsComponent } from './components/tournament-teams/tournament-teams';
import { RegistrationUsersComponent } from './components/registration-users/registration-users';

@Component({
  selector: 'app-tournament-config',
  imports: [
    CommonModule,
    TournamentInfoComponent,
    TournamentTeamsComponent,
    RegistrationUsersComponent,
  ],
  templateUrl: './tournament-config.html',
  styleUrl: './tournament-config.scss'
})
export class TournamentConfig implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(TournamentService);

  tournamentId!: string;
  tournament$!: Observable<ITournament>;
  activeTab = 'info';

  ngOnInit() {
    this.tournamentId = this.route.snapshot.params['tournamentId'];
    if (!this.tournamentId) {
      this.router.navigate(['/groups']);
      return;
    }
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  goBack() {
    const groupId = this.route.snapshot.params['groupId'];
    this.router.navigate(['/manage-tournaments', groupId]);
  }
}