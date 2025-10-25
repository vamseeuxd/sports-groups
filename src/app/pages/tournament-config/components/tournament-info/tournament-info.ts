import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TournamentService } from '../../../../services/tournament.service';
import { ITournament } from '../../../../models/group.model';

@Component({
  selector: 'app-tournament-info',
  imports: [CommonModule],
  templateUrl: './tournament-info.html',
  styleUrl: './tournament-info.scss'
})
export class TournamentInfoComponent implements OnInit {
  @Input() tournamentId!: string;
  
  private tournamentService = inject(TournamentService);
  tournament$!: Observable<ITournament>;

  ngOnInit() {
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId);
  }
}