import { Component, inject, input, OnInit } from '@angular/core';
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

  tournamentId = input.required<string>();
  tournament$!: Observable<ITournament>;
  activeTab = input.required<string>();

  ngOnInit() {
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId());
  }

  setActiveTab(tab: string) {
    // this.activeTab = tab;
    this.router.navigate(['/tournament-config', this.route.snapshot.params['groupId'], this.tournamentId(), tab]);
  }

  goBack() {
    const groupId = this.route.snapshot.params['groupId'];
    this.router.navigate(['/manage-tournaments', groupId]);
  }
}