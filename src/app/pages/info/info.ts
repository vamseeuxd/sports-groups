import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { TournamentService } from '../../services/tournament.service';
import { ITournament } from '../../models';

@Component({
  selector: 'info',
  imports: [CommonModule],
  templateUrl: './info.html',
  styleUrl: './info.scss'
})
export class InfoComponent implements OnInit {
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