import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { UserService } from '../../services/user.service';
import { LiveScoreboardComponent } from '../../components/live-scoreboard/live-scoreboard.component';
import { IKnockoutMatch } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-live-score',
  standalone: true,
  imports: [CommonModule, LiveScoreboardComponent],
  templateUrl: './live-score.html',
  styleUrl: './live-score.scss'
})
export class LiveScoreComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matchService = inject(MatchService);
  private userService = inject(UserService);

  match: IKnockoutMatch | null = null;
  canUpdateScore = false;
  loading = true;

  async ngOnInit() {
    const matchId = this.route.snapshot.params['matchId'];
    if (!matchId) {
      this.router.navigate(['/']);
      return;
    }

    try {
      this.match = await firstValueFrom(this.matchService.getMatchById(matchId));
      const user = await firstValueFrom(this.userService.user$);
      this.canUpdateScore = true; // For now, allow all authenticated users
    } catch (error) {
      console.error('Error loading match:', error);
      this.router.navigate(['/']);
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/planner']);
  }
}