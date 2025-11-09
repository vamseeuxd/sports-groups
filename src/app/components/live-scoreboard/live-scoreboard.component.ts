import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveScoreService, ILiveScore } from '../../services/live-score.service';
import { UserService } from '../../services/user.service';
import { IKnockoutMatch } from '../../models';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-live-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-broadcast me-2"></i>Live Scoreboard
        </h5>
        <span class="badge" [class]="getStatusBadgeClass()">
          {{ match.status | titlecase }}
        </span>
      </div>
      
      <div class="card-body">
        <!-- Teams Display -->
        <div class="row mb-4">
          <div class="col-5 text-center">
            <div class="team-card p-3 border rounded">
              <h6 class="mb-2">{{ match.team1?.name || 'Team 1' }}</h6>
              <div class="score-display my-3">{{ liveScore?.team1Score || 0 }}</div>
              <small class="text-muted">Sets: {{ liveScore?.team1Sets || 0 }}</small>
            </div>
          </div>
          
          <div class="col-2 text-center d-flex align-items-center justify-content-center">
            <div class="vs-display">VS</div>
          </div>
          
          <div class="col-5 text-center">
            <div class="team-card p-3 border rounded">
              <h6 class="mb-2">{{ match.team2?.name || 'Team 2' }}</h6>
              <div class="score-display my-3">{{ liveScore?.team2Score || 0 }}</div>
              <small class="text-muted">Sets: {{ liveScore?.team2Sets || 0 }}</small>
            </div>
          </div>
        </div>

        <!-- Current Set Info -->
        <div class="text-center mb-3" *ngIf="liveScore?.currentSet">
          <span class="badge bg-info">Set {{ liveScore?.currentSet }}</span>
        </div>

        <!-- Score Controls (Only for authorized users) -->
        <div *ngIf="canUpdateScore && match.status === 'in-progress'" class="score-controls">
          <div class="row g-2">
            <div class="col-6">
              <div class="d-grid gap-2">
                <button class="btn btn-success" (click)="updateScore('team1', 1)">
                  +1 {{ match.team1?.name }}
                </button>
                <button class="btn btn-outline-danger" (click)="updateScore('team1', -1)">
                  -1 {{ match.team1?.name }}
                </button>
              </div>
            </div>
            <div class="col-6">
              <div class="d-grid gap-2">
                <button class="btn btn-success" (click)="updateScore('team2', 1)">
                  +1 {{ match.team2?.name }}
                </button>
                <button class="btn btn-outline-danger" (click)="updateScore('team2', -1)">
                  -1 {{ match.team2?.name }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="row g-2 mt-2">
            <div class="col-6">
              <button class="btn btn-warning w-100" (click)="completeSet('team1')">
                {{ match.team1?.name }} Wins Set
              </button>
            </div>
            <div class="col-6">
              <button class="btn btn-warning w-100" (click)="completeSet('team2')">
                {{ match.team2?.name }} Wins Set
              </button>
            </div>
          </div>
          
          <div class="mt-3 text-center">
            <button class="btn btn-danger" (click)="endMatch()">
              End Match
            </button>
          </div>
        </div>

        <!-- Start Match Button -->
        <div *ngIf="canUpdateScore && match.status === 'pending'" class="text-center">
          <button class="btn btn-primary btn-lg" (click)="startMatch()">
            <i class="bi bi-play-fill me-2"></i>Start Match
          </button>
        </div>

        <!-- Last Updated Info -->
        <div *ngIf="liveScore?.lastUpdated" class="text-center mt-3">
          <small class="text-muted">
            Last updated: {{ getFormattedDate(liveScore?.lastUpdated) | date:'short' }}
            by {{ liveScore?.updatedBy }}
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .score-display {
      font-size: 3rem;
      font-weight: bold;
      color: var(--theme-primary);
    }
    
    .vs-display {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--theme-secondary);
    }
    
    .team-card {
      background: var(--theme-lighter);
      border-color: var(--theme-accent) !important;
    }
    
    .score-controls {
      border-top: 1px solid var(--theme-accent);
      padding-top: 1rem;
    }
  `]
})
export class LiveScoreboardComponent implements OnInit, OnDestroy {
  @Input() match!: IKnockoutMatch;
  @Input() canUpdateScore = false;

  private liveScoreService = inject(LiveScoreService);
  private userService = inject(UserService);
  
  liveScore: ILiveScore | null = null;
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.liveScoreService.getLiveScore(this.match.id).subscribe(
      score => this.liveScore = score
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  async startMatch() {
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;
    
    await this.liveScoreService.startMatch(this.match.id, user.email);
  }

  async updateScore(team: 'team1' | 'team2', change: number) {
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const currentScore = this.liveScore ? 
      (team === 'team1' ? (this.liveScore.team1Score || 0) : (this.liveScore.team2Score || 0)) : 0;
    const safeCurrentScore = isNaN(currentScore) ? 0 : currentScore;
    const newScore = Math.max(0, safeCurrentScore + change);

    try {
      await this.liveScoreService.updateScore(this.match.id, {
        matchId: this.match.id,
        [team === 'team1' ? 'team1Score' : 'team2Score']: newScore
      }, user.email);
    } catch (error) {
      console.error('Error updating score:', error);
    }
  }

  async completeSet(winner: 'team1' | 'team2') {
    if (!this.liveScore) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const team1Sets = winner === 'team1' ? (this.liveScore.team1Sets || 0) + 1 : (this.liveScore.team1Sets || 0);
    const team2Sets = winner === 'team2' ? (this.liveScore.team2Sets || 0) + 1 : (this.liveScore.team2Sets || 0);

    await this.liveScoreService.updateScore(this.match.id, {
      team1Sets,
      team2Sets,
      team1Score: 0,
      team2Score: 0,
      currentSet: (this.liveScore.currentSet || 1) + 1
    }, user.email);
  }

  async endMatch() {
    // Logic to determine winner and end match
  }

  getStatusBadgeClass(): string {
    switch (this.match.status) {
      case 'pending': return 'text-bg-warning';
      case 'in-progress': return 'text-bg-success';
      case 'completed': return 'text-bg-primary';
      default: return 'text-bg-secondary';
    }
  }

  getFormattedDate(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

}