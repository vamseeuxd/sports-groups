import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { TournamentService } from '../../../../services/tournament.service';
import { ITournament } from '../../../../models/group.model';
import { Timestamp } from 'firebase/firestore';

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
    this.tournament$ = this.tournamentService.getTournamentById(this.tournamentId).pipe(
      map(tournament => {
        if (!tournament) return tournament;
        return {
          ...tournament,
          startDate: tournament.startDate instanceof Timestamp 
            ? tournament.startDate.toDate() 
            : tournament.startDate
        };
      })
    );
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
}