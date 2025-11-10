import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveScoreService, ILiveScore, ICricketData } from '../../services/live-score.service';
import { UserService } from '../../services/user.service';
import { MatchService } from '../../services/match.service';
import { IKnockoutMatch } from '../../models';
import { Subscription, firstValueFrom } from 'rxjs';
import { PlayerRegistrationService } from '../../services/player-registration.service';
import { LoaderService } from '../../services';
import { SharedLayoutComponent } from '../shared-layout/shared-layout.component';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';

@Component({
  selector: 'app-cricket-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedLayoutComponent, SharedModalComponent],
  template: `
    <app-shared-layout 
      title="Cricket Match" 
      icon="bi-trophy"
      [actions]="getActionMenuItems()"
      [loading]="false">
      
      <!-- Match Score Display -->
      <div class="score-display-section mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="team-score-card">
              <div class="team-header">
                <h6 class="team-name">{{ match.team1?.name }}</h6>
                <span class="innings-indicator" *ngIf="liveScore?.cricketData?.currentInning === 1">
                  <i class="bi bi-circle-fill text-success"></i> Batting
                </span>
              </div>
              <div class="score-display">
                <span class="runs-wickets">{{ getCricketScore('team1') }}</span>
                <small class="overs-display">({{ getOversDisplay('team1') }} overs)</small>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="team-score-card">
              <div class="team-header">
                <h6 class="team-name">{{ match.team2?.name }}</h6>
                <span class="innings-indicator" *ngIf="liveScore?.cricketData?.currentInning === 2">
                  <i class="bi bi-circle-fill text-success"></i> Batting
                </span>
              </div>
              <div class="score-display">
                <span class="runs-wickets">{{ getCricketScore('team2') }}</span>
                <small class="overs-display">({{ getOversDisplay('team2') }} overs)</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Match Status -->
      <div *ngIf="liveScore?.cricketData" class="current-status-section mb-4">
        <div class="status-card">
          <div class="row g-3">
            <div class="col-md-8">
              <div class="current-players">
                <div class="batsmen-info">
                  <strong>{{ getCurrentBattingTeam() }} Batting:</strong>
                  <div class="player-stats mt-2">
                    <div *ngFor="let batsman of liveScore?.cricketData?.currentBatsmen || []; let i = index" class="batsman-stat">
                      <span class="player-name">{{ getPlayerName(batsman) }}</span>
                      <span class="player-role">{{ i === 0 ? '(Striker)' : '(Non-Striker)' }}</span>
                      <span class="player-score">{{ getBatsmanStats(batsman) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="bowling-info">
                <strong>Bowler:</strong>
                <div class="bowler-stat mt-2">
                  <div class="player-name">{{ getPlayerName(liveScore?.cricketData?.currentBowler) || 'N/A' }}</div>
                  <div class="player-score">{{ getBowlerStats(liveScore?.cricketData?.currentBowler) }}</div>
                </div>
                <div class="over-info mt-2">
                  <strong>Over:</strong> {{ getCurrentOverDisplay() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Controls -->
      <div *ngIf="canUpdateScore && match.status === 'in-progress'" class="scoring-section">
        <div class="section-header">
          <h6><i class="bi bi-controller me-2"></i>Scoring Controls</h6>
        </div>
        
        <div class="runs-section mb-3">
          <label class="control-label">Runs</label>
          <div class="button-grid">
            <button class="score-btn dot-btn" (click)="addRuns(0)" [disabled]="isOverComplete()">Dot</button>
            <button class="score-btn runs-btn" (click)="addRuns(1)" [disabled]="isOverComplete()">1</button>
            <button class="score-btn runs-btn" (click)="addRuns(2)" [disabled]="isOverComplete()">2</button>
            <button class="score-btn runs-btn" (click)="addRuns(3)" [disabled]="isOverComplete()">3</button>
            <button class="score-btn boundary-btn" (click)="addRuns(4)" [disabled]="isOverComplete()">4</button>
            <button class="score-btn six-btn" (click)="addRuns(6)" [disabled]="isOverComplete()">6</button>
          </div>
        </div>
        
        <div class="extras-section mb-3">
          <label class="control-label">Extras</label>
          <div class="button-grid">
            <button class="score-btn extra-btn" (click)="addExtra('wides')" [disabled]="isOverComplete()">Wide</button>
            <button class="score-btn extra-btn" (click)="addExtra('noBalls')" [disabled]="isOverComplete()">No Ball</button>
            <button class="score-btn extra-btn" (click)="addExtra('byes')" [disabled]="isOverComplete()">Bye</button>
            <button class="score-btn extra-btn" (click)="addExtra('legByes')" [disabled]="isOverComplete()">Leg Bye</button>
          </div>
        </div>
        
        <div class="action-section mb-3">
          <div class="row g-2">
            <div class="col-6">
              <button class="btn btn-danger w-100" (click)="openWicketModal()" [disabled]="isOverComplete()">
                <i class="bi bi-x-circle me-2"></i>Wicket
              </button>
            </div>
            <div class="col-6">
              <button class="btn btn-info w-100" (click)="openEndOverModal()" [disabled]="!isOverComplete()">
                <i class="bi bi-arrow-right-circle me-2"></i>End Over
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="actionHistory.length > 0" class="undo-section">
          <button class="btn btn-outline-danger w-100" (click)="undoLastAction()">
            <i class="bi bi-arrow-counterclockwise me-2"></i>Undo Last Action ({{ actionHistory.length }})
          </button>
        </div>
      </div>

      <!-- Initialize Cricket Data -->
      <div *ngIf="canUpdateScore && !liveScore?.cricketData" class="init-section text-center">
        <div class="empty-state">
          <i class="bi bi-gear display-4 text-muted mb-3"></i>
          <h5>Initialize Cricket Data</h5>
          <p class="text-muted">Set up the match to start scoring</p>
          <button class="btn btn-primary" (click)="initializeCricketData()">
            <i class="bi bi-play-circle me-2"></i>Start Match
          </button>
        </div>
      </div>

      <!-- Match Control Buttons -->
      <div *ngIf="canUpdateScore && liveScore?.cricketData" class="match-control-section">
        <div *ngIf="isInningsComplete() && !isBothInningsComplete()" class="text-center mb-3">
          <button class="btn btn-success btn-lg" (click)="startNextInnings()">
            <i class="bi bi-arrow-right me-2"></i>Start Next Innings
          </button>
        </div>
        <div *ngIf="isBothInningsComplete()" class="text-center">
          <button class="btn btn-danger btn-lg" (click)="endMatch()">
            <i class="bi bi-trophy me-2"></i>End Match & Announce Winner
          </button>
        </div>
      </div>
    </app-shared-layout>

    <!-- Wicket Modal -->
    <app-shared-modal 
      *ngIf="showWicketModal"
      title="Wicket Details"
      [show]="showWicketModal"
      [showFooter]="false"
      (closed)="closeWicketModal()">
      <div class="modal-body-content">
        <div class="mb-3">
          <label class="form-label">Out Batsman</label>
          <select class="form-select" [(ngModel)]="selectedOutBatsman">
            <option value="">Select batsman who got out</option>
            <option *ngFor="let batsman of liveScore?.cricketData?.currentBatsmen" [value]="batsman">
              {{ getPlayerName(batsman) }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">New Batsman</label>
          <select class="form-select" [(ngModel)]="selectedNewBatsman">
            <option value="">Select new batsman</option>
            <option *ngFor="let playerId of getAvailableBatsmen()" [value]="playerId">
              {{ getPlayerName(playerId) }}
            </option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="closeWicketModal()">Cancel</button>
        <button type="button" class="btn btn-danger" (click)="confirmWicket()" [disabled]="!selectedOutBatsman || !selectedNewBatsman">
          <i class="bi bi-x-circle me-2"></i>Confirm Wicket
        </button>
      </div>
    </app-shared-modal>

    <!-- Player Statistics Modal -->
    <app-shared-modal 
      *ngIf="showStatsModal"
      title="Player Statistics"
      [show]="showStatsModal"
      modalSize="modal-lg"
      [showFooter]="false"
      (closed)="closeStatsModal()">
      <div class="modal-body-content">
        <div class="row">
          <div class="col-md-6">
            <h6><i class="bi bi-bat me-2"></i>Batting Stats</h6>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Player</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let stat of getBattingStats()">
                    <td>{{ getPlayerName(stat.playerId) }}</td>
                    <td><strong>{{ stat.batting?.runs }}</strong></td>
                    <td>{{ stat.batting?.balls }}</td>
                    <td>{{ stat.batting?.fours }}</td>
                    <td>{{ stat.batting?.sixes }}</td>
                    <td>{{ getStrikeRate(stat.batting?.runs || 0, stat.batting?.balls || 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-md-6">
            <h6><i class="bi bi-circle me-2"></i>Bowling Stats</h6>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Player</th>
                    <th>Overs</th>
                    <th>Runs</th>
                    <th>Wickets</th>
                    <th>Economy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let stat of getBowlingStats()">
                    <td>{{ getPlayerName(stat.playerId) }}</td>
                    <td>{{ getBowlingOvers(stat.bowling?.overs || 0, stat.bowling?.balls || 0) }}</td>
                    <td>{{ stat.bowling?.runs }}</td>
                    <td><strong>{{ stat.bowling?.wickets }}</strong></td>
                    <td>{{ getEconomyRate(stat.bowling?.runs || 0, stat.bowling?.overs || 0, stat.bowling?.balls || 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </app-shared-modal>

    <!-- End Over Modal -->
    <app-shared-modal 
      *ngIf="showEndOverModal"
      title="End Over"
      [show]="showEndOverModal"
      [showFooter]="false"
      (closed)="closeEndOverModal()">
      <div class="modal-body-content">
        <div class="mb-3">
          <label class="form-label">Select Next Bowler</label>
          <select class="form-select" [(ngModel)]="selectedNextBowler">
            <option value="">Select bowler for next over</option>
            <option *ngFor="let playerId of getBowlingTeamPlayers()" [value]="playerId">
              {{ getPlayerName(playerId) }}
            </option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="closeEndOverModal()">Cancel</button>
        <button type="button" class="btn btn-info" (click)="confirmEndOver()" [disabled]="!selectedNextBowler">
          <i class="bi bi-arrow-right-circle me-2"></i>End Over
        </button>
      </div>
    </app-shared-modal>

    <!-- Player Selection Modal -->
    <app-shared-modal 
      *ngIf="showPlayerSelectionModal"
      title="Player Selection"
      [show]="showPlayerSelectionModal"
      [showFooter]="false"
      (closed)="closePlayerSelectionModal()">
      <div class="modal-body-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label"><i class="bi bi-person-check me-2"></i>Striker</label>
            <select class="form-select" [(ngModel)]="selectedStriker" (change)="updateCurrentPlayers()">
              <option *ngFor="let playerId of getCurrentTeamPlayers()" [value]="playerId">{{ getPlayerName(playerId) }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label"><i class="bi bi-person me-2"></i>Non-Striker</label>
            <select class="form-select" [(ngModel)]="selectedNonStriker" (change)="updateCurrentPlayers()">
              <option *ngFor="let playerId of getCurrentTeamPlayers()" [value]="playerId">{{ getPlayerName(playerId) }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label"><i class="bi bi-circle me-2"></i>Bowler</label>
            <select class="form-select" [(ngModel)]="selectedBowler" (change)="updateCurrentBowler()">
              <option *ngFor="let playerId of getBowlingTeamPlayers()" [value]="playerId">{{ getPlayerName(playerId) }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closePlayerSelectionModal()">Close</button>
        </div>
      </div>
    </app-shared-modal>

    <!-- Match Status Modal -->
    <app-shared-modal 
      *ngIf="showMatchStatusModal"
      title="Current Match Status"
      [show]="showMatchStatusModal"
      [showFooter]="false"
      (closed)="closeMatchStatusModal()">
      <div class="modal-body-content">
        <div class="status-info">
          <h6><i class="bi bi-circle-fill text-success me-2"></i>Current Batting: {{ getCurrentBattingTeam() }}</h6>
          <div class="row mt-3">
            <div class="col-md-6">
              <div class="info-section">
                <strong><i class="bi bi-people me-2"></i>Batsmen:</strong>
                <div *ngFor="let batsman of liveScore?.cricketData?.currentBatsmen || []; let i = index" class="player-info mt-2">
                  <div class="player-name">{{ getPlayerName(batsman) }} <span class="badge bg-secondary">{{ i === 0 ? 'Striker' : 'Non-Striker' }}</span></div>
                  <small class="text-muted">{{ getBatsmanStats(batsman) }}</small>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-section">
                <strong><i class="bi bi-circle me-2"></i>Bowler:</strong>
                <div class="player-info mt-2">
                  <div class="player-name">{{ getPlayerName(liveScore?.cricketData?.currentBowler) || 'N/A' }}</div>
                  <small class="text-muted">{{ getBowlerStats(liveScore?.cricketData?.currentBowler) }}</small>
                </div>
                <hr>
                <strong><i class="bi bi-clock me-2"></i>Current Over:</strong> {{ getCurrentOverDisplay() }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeMatchStatusModal()">Close</button>
        </div>
      </div>
    </app-shared-modal>
  `,
  styles: [`
    .score-display-section {
      background: var(--theme-lighter);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--theme-accent);
    }
    
    .team-score-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--theme-accent);
      height: 100%;
    }
    
    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .team-name {
      margin: 0;
      color: var(--theme-primary);
      font-weight: 600;
    }
    
    .innings-indicator {
      font-size: 0.875rem;
      color: var(--theme-success);
    }
    
    .score-display {
      text-align: center;
    }
    
    .runs-wickets {
      font-size: 2rem;
      font-weight: bold;
      color: var(--theme-primary);
      display: block;
    }
    
    .overs-display {
      color: var(--theme-muted);
      font-size: 0.875rem;
    }
    
    .current-status-section .status-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--theme-accent);
    }
    
    .player-stats .batsman-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--theme-lighter);
    }
    
    .player-name {
      font-weight: 500;
      color: var(--theme-primary);
    }
    
    .player-role {
      font-size: 0.875rem;
      color: var(--theme-muted);
    }
    
    .player-score {
      font-weight: 600;
      color: var(--theme-secondary);
    }
    
    .scoring-section {
      background: var(--theme-lighter);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--theme-accent);
    }
    
    .section-header h6 {
      color: var(--theme-primary);
      margin-bottom: 1rem;
    }
    
    .control-label {
      font-weight: 600;
      color: var(--theme-secondary);
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .button-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .extras-section .button-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    
    .score-btn {
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .dot-btn {
      background: var(--theme-success);
      color: white;
    }
    
    .runs-btn {
      background: var(--theme-primary);
      color: white;
    }
    
    .boundary-btn {
      background: var(--theme-warning);
      color: white;
    }
    
    .six-btn {
      background: var(--theme-danger);
      color: white;
    }
    
    .extra-btn {
      background: var(--theme-secondary);
      color: white;
    }
    
    .score-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .score-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .empty-state {
      padding: 3rem 1rem;
    }
    
    .match-control-section {
      padding: 1rem;
      text-align: center;
    }
    
    .modal-body-content {
      padding: 0;
    }
    
    .status-info .info-section {
      padding: 1rem;
      background: var(--theme-lighter);
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    .status-info .player-info {
      padding: 0.75rem;
      background: white;
      border-radius: 4px;
      border: 1px solid var(--theme-accent);
    }
    
    .table-hover tbody tr:hover {
      background-color: var(--theme-lighter);
    }
    
    .badge {
      font-size: 0.75rem;
    }
  `]
})
export class CricketScoreboardComponent implements OnInit, OnDestroy {
  @Input() match!: IKnockoutMatch;
  @Input() canUpdateScore = false;

  private liveScoreService = inject(LiveScoreService);
  private userService = inject(UserService);
  private matchService = inject(MatchService);
  private playerRegistrationService = inject(PlayerRegistrationService);
  private loaderService = inject(LoaderService);
  
  liveScore: ILiveScore | null = null;
  private subscription?: Subscription;
  
  selectedStriker = '';
  selectedNonStriker = '';
  selectedBowler = '';
  
  playerNames: { [key: string]: string } = {};
  showWicketModal = false;
  selectedOutBatsman = '';
  selectedNewBatsman = '';
  showStatsModal = false;
  showEndOverModal = false;
  selectedNextBowler = '';
  actionHistory: any[] = [];
  showPlayerSelectionModal = false;
  showMatchStatusModal = false;
  
  getActionMenuItems() {
    const items = [];
    
    if (this.liveScore?.cricketData) {
      items.push({
        label: 'Match Status',
        icon: 'bi-info-circle',
        handler: () => this.openMatchStatusModal()
      });
      
      items.push({
        label: 'Player Statistics',
        icon: 'bi-bar-chart',
        handler: () => this.openStatsModal()
      });
      
      if (this.canUpdateScore) {
        items.push({
          label: 'Player Selection',
          icon: 'bi-people',
          handler: () => this.openPlayerSelectionModal()
        });
      }
    }
    
    return items;
  }
  
  private speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }

  ngOnInit() {
    this.subscription = this.liveScoreService.getLiveScore(this.match.id).subscribe(
      score => {
        this.liveScore = score;
        if (score?.cricketData && !this.selectedStriker) {
          this.initializeSelectedPlayers();
        }
      }
    );
    this.loadPlayerNames();
  }
  
  private async loadPlayerNames() {
    const id = this.loaderService.show();
    const allPlayerIds = [...(this.match.team1?.playerIds || []), ...(this.match.team2?.playerIds || [])];
    for (const playerId of allPlayerIds) {
      const x = await this.playerRegistrationService.getRegistoredPlayerById(playerId);
      this.playerNames[playerId] = x?.playerName || playerId;
    }
    this.loaderService.hide(id);
  }
  
  getPlayerName(playerId: string | undefined): string {
    if (!playerId) return 'Unknown';
    return this.playerNames[playerId] || playerId.substring(0, 8) + '...';
  }
  
  private initializeSelectedPlayers() {
    if (!this.liveScore?.cricketData) return;
    
    const currentBatsmen = this.liveScore.cricketData.currentBatsmen;
    if (currentBatsmen.length >= 2) {
      this.selectedStriker = currentBatsmen[0];
      this.selectedNonStriker = currentBatsmen[1];
    }
    
    this.selectedBowler = this.liveScore.cricketData.currentBowler;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  async addRuns(runs: number) {
    if (!this.liveScore?.cricketData) {
      alert('Please initialize cricket data first');
      return;
    }
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    // Store current state for undo
    this.actionHistory.push({
      type: 'runs',
      data: JSON.parse(JSON.stringify(this.liveScore.cricketData)),
      runs: runs
    });
    if (this.actionHistory.length > 10) this.actionHistory.shift();

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    const currentInnings = cricketData.currentInning === 1 ? cricketData.team1Innings : cricketData.team2Innings;
    
    currentInnings.runs += runs;
    currentInnings.balls++;
    cricketData.balls++;
    
    this.updatePlayerStats(currentInnings, cricketData.currentBatsmen[0], runs, false);
    this.updateBowlerStats(currentInnings, cricketData.currentBowler, runs, false);
    
    // Swap batsmen if odd runs scored
    if (runs % 2 === 1) {
      [cricketData.currentBatsmen[0], cricketData.currentBatsmen[1]] = [cricketData.currentBatsmen[1], cricketData.currentBatsmen[0]];
      // Update selected players to reflect the swap
      [this.selectedStriker, this.selectedNonStriker] = [this.selectedNonStriker, this.selectedStriker];
    }

    await this.liveScoreService.updateScore(this.match.id, {
      cricketData,
      [cricketData.currentInning === 1 ? 'team1Score' : 'team2Score']: currentInnings.runs
    }, user.email);
    
    // Commentary
    const batsmanName = this.getPlayerName(cricketData.currentBatsmen[0]);
    const bowlerName = this.getPlayerName(cricketData.currentBowler);
    const teamName = cricketData.currentInning === 1 ? this.match.team1?.name : this.match.team2?.name;
    const score = `${currentInnings.runs} for ${currentInnings.wickets}`;
    const overs = this.getCurrentOverDisplay();
    const dotComments = ['Brilliant bowling! Absolutely unplayable!', 'Oh my word! What a delivery!', 'Beaten all ends up! Magnificent bowling!', 'The batsman had no answer to that one!', 'Superb line and length! The crowd gasps!'];
    const singleComments = ['Clever batting! Quick thinking between the wickets!', 'Excellent running! They make it look so easy!', 'Smart cricket! Rotating the strike beautifully!', 'Great awareness! Keeping the scoreboard ticking!'];
    const boundaryComments = ['MAGNIFICENT! Absolutely stunning shot!', 'GLORIOUS! What a way to find the fence!', 'SPECTACULAR! The crowd erupts in joy!', 'BREATHTAKING! Pure class from the batsman!', 'INCREDIBLE! That shot will be replayed for years!'];
    const sixComments = ['UNBELIEVABLE! That ball has been murdered!', 'PHENOMENAL! Into orbit it goes!', 'EXTRAORDINARY! The crowd goes absolutely wild!', 'SENSATIONAL! What power! What timing!', 'MONSTROUS! That ball may never come down!'];
    
    if (runs === 0) this.speak(`${bowlerName} to ${batsmanName}... ${dotComments[Math.floor(Math.random() * dotComments.length)]}. ${teamName} ${score} after ${overs} overs`);
    else if (runs === 1) this.speak(`${batsmanName} ${singleComments[Math.floor(Math.random() * singleComments.length)]}. ${teamName} now ${score} after ${overs} overs`);
    else if (runs === 2) this.speak(`${batsmanName} finds the gap, they'll come back for two. ${teamName} ${score} after ${overs} overs`);
    else if (runs === 3) this.speak(`${batsmanName} places it well, running hard for three. ${teamName} ${score} after ${overs} overs`);
    else if (runs === 4) this.speak(`FOUR! ${boundaryComments[Math.floor(Math.random() * boundaryComments.length)]} ${batsmanName} finds the boundary off ${bowlerName}. ${teamName} ${score} after ${overs} overs`);
    else if (runs === 6) this.speak(`SIX! ${sixComments[Math.floor(Math.random() * sixComments.length)]} ${batsmanName} sends it sailing over the ropes! ${teamName} ${score} after ${overs} overs`);
  }

  async addExtra(type: 'wides' | 'noBalls' | 'byes' | 'legByes') {
    if (!this.liveScore?.cricketData) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    // Store current state for undo
    this.actionHistory.push({
      type: 'extra',
      data: JSON.parse(JSON.stringify(this.liveScore.cricketData)),
      extraType: type
    });
    if (this.actionHistory.length > 10) this.actionHistory.shift();

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    const currentInnings = cricketData.currentInning === 1 ? cricketData.team1Innings : cricketData.team2Innings;
    
    currentInnings.extras[type]++;
    currentInnings.runs++;
    
    if (type !== 'wides' && type !== 'noBalls') {
      currentInnings.balls++;
      cricketData.balls++;
      if (cricketData.balls === 6) {
        cricketData.overs++;
        cricketData.balls = 0;
        currentInnings.overs++;
        currentInnings.balls = 0;
      }
    }

    await this.liveScoreService.updateScore(this.match.id, {
      cricketData,
      [cricketData.currentInning === 1 ? 'team1Score' : 'team2Score']: currentInnings.runs
    }, user.email);
    
    // Commentary
    const bowlerName = this.getPlayerName(cricketData.currentBowler);
    const teamName = cricketData.currentInning === 1 ? this.match.team1?.name : this.match.team2?.name;
    const score = `${currentInnings.runs} for ${currentInnings.wickets}`;
    const overs = this.getCurrentOverDisplay();
    const wideComments = ['Wayward delivery!', 'Loses his line!', 'Pressure showing!'];
    const noBallComments = ['Overstepped!', 'Front foot fault!', 'Costly mistake!'];
    
    if (type === 'wides') this.speak(`Wide! ${wideComments[Math.floor(Math.random() * wideComments.length)]} ${bowlerName} strays down the leg side. ${teamName} ${score} after ${overs} overs`);
    else if (type === 'noBalls') this.speak(`No ball! ${noBallComments[Math.floor(Math.random() * noBallComments.length)]} ${bowlerName} will have to bowl that again, and it's a free hit! ${teamName} ${score} after ${overs} overs`);
    else if (type === 'byes') this.speak(`Bye! Keeper couldn't collect it cleanly, batsmen scamper through for the extra. ${teamName} ${score} after ${overs} overs`);
    else if (type === 'legByes') this.speak(`Leg bye! Off the pads, appeal for LBW but going down leg, they'll take the run. ${teamName} ${score} after ${overs} overs`);
  }

  openWicketModal() {
    this.showWicketModal = true;
    this.selectedOutBatsman = '';
    this.selectedNewBatsman = '';
  }

  closeWicketModal() {
    this.showWicketModal = false;
    this.selectedOutBatsman = '';
    this.selectedNewBatsman = '';
  }

  openStatsModal() {
    this.showStatsModal = true;
  }

  closeStatsModal() {
    this.showStatsModal = false;
  }

  openPlayerSelectionModal() {
    this.showPlayerSelectionModal = true;
  }

  closePlayerSelectionModal() {
    this.showPlayerSelectionModal = false;
  }

  openMatchStatusModal() {
    this.showMatchStatusModal = true;
  }

  closeMatchStatusModal() {
    this.showMatchStatusModal = false;
  }

  isInningsComplete(): boolean {
    if (!this.liveScore?.cricketData) return false;
    const currentInnings = this.liveScore.cricketData.currentInning === 1 ? 
      this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    return currentInnings.wickets >= 10;
  }

  isBothInningsComplete(): boolean {
    if (!this.liveScore?.cricketData) return false;
    return this.liveScore.cricketData.currentInning === 2 && this.isInningsComplete();
  }

  async startNextInnings() {
    if (!this.liveScore?.cricketData) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    cricketData.currentInning = 2;
    
    const team2Players = this.match.team2?.playerIds || [];
    const team1Players = this.match.team1?.playerIds || [];
    
    cricketData.currentBatsmen = [team2Players[0] || 'Batsman 1', team2Players[1] || 'Batsman 2'];
    cricketData.currentBowler = team1Players[0] || 'Bowler 1';
    cricketData.overs = 0;
    cricketData.balls = 0;

    await this.liveScoreService.updateScore(this.match.id, { cricketData }, user.email);
    
    this.speak(`End of first innings. ${this.match.team1?.name} scored ${cricketData.team1Innings.runs} for ${cricketData.team1Innings.wickets}. ${this.match.team2?.name} needs ${cricketData.team1Innings.runs + 1} runs to win.`);
  }

  async endMatch() {
    if (!this.liveScore?.cricketData) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const cricketData = this.liveScore.cricketData;
    const team1Score = cricketData.team1Innings.runs;
    const team2Score = cricketData.team2Innings.runs;
    
    let winnerTeam = undefined;
    let winnerName = '';
    let margin = '';
    
    if (team1Score > team2Score) {
      winnerTeam = this.match.team1;
      winnerName = this.match.team1?.name || 'Team 1';
      margin = `by ${team1Score - team2Score} runs`;
    } else if (team2Score > team1Score) {
      winnerTeam = this.match.team2;
      winnerName = this.match.team2?.name || 'Team 2';
      const wicketsLeft = 10 - cricketData.team2Innings.wickets;
      margin = `by ${wicketsLeft} wickets`;
    } else {
      winnerName = 'Match Tied';
      margin = '';
    }

    await this.liveScoreService.updateScore(this.match.id, { cricketData }, user.email);
    await this.matchService.updateMatch(this.match.id, {
      status: 'completed',
      winner: winnerTeam
    });
    
    this.speak(`Match completed! ${winnerName} wins ${margin}. What a fantastic game of cricket!`);
  }

  getAvailableBatsmen() {
    if (!this.liveScore?.cricketData) return [];
    
    const battingTeam = this.liveScore.cricketData.currentInning === 1 ? this.match.team1 : this.match.team2;
    const teamPlayers = battingTeam?.playerIds || [];
    const currentInnings = this.liveScore.cricketData.currentInning === 1 ? 
      this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    
    return teamPlayers.filter(playerId => 
      !this.liveScore?.cricketData?.currentBatsmen.includes(playerId) && 
      !currentInnings.playerStats.some((p: any) => p.playerId === playerId && p.batting?.isOut)
    );
  }

  async confirmWicket() {
    if (!this.liveScore?.cricketData || !this.selectedOutBatsman || !this.selectedNewBatsman) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    // Store current state for undo
    this.actionHistory.push({
      type: 'wicket',
      data: JSON.parse(JSON.stringify(this.liveScore.cricketData)),
      outBatsman: this.selectedOutBatsman,
      newBatsman: this.selectedNewBatsman
    });
    if (this.actionHistory.length > 10) this.actionHistory.shift();

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    const currentInnings = cricketData.currentInning === 1 ? cricketData.team1Innings : cricketData.team2Innings;
    
    currentInnings.wickets++;
    currentInnings.balls++;
    cricketData.balls++;
    
    this.updatePlayerStats(currentInnings, this.selectedOutBatsman, 0, true);
    this.updateBowlerStats(currentInnings, cricketData.currentBowler, 0, true);
    
    // Replace the out batsman with new batsman
    const outBatsmanIndex = cricketData.currentBatsmen.indexOf(this.selectedOutBatsman);
    if (outBatsmanIndex !== -1) {
      cricketData.currentBatsmen[outBatsmanIndex] = this.selectedNewBatsman;
      if (outBatsmanIndex === 0) {
        this.selectedStriker = this.selectedNewBatsman;
      } else {
        this.selectedNonStriker = this.selectedNewBatsman;
      }
    }
    
    if (cricketData.balls === 6) {
      cricketData.overs++;
      cricketData.balls = 0;
      currentInnings.overs++;
      currentInnings.balls = 0;
      // Swap batsmen at end of over
      [cricketData.currentBatsmen[0], cricketData.currentBatsmen[1]] = [cricketData.currentBatsmen[1], cricketData.currentBatsmen[0]];
      [this.selectedStriker, this.selectedNonStriker] = [this.selectedNonStriker, this.selectedStriker];
    }

    await this.liveScoreService.updateScore(this.match.id, {
      cricketData,
      [cricketData.currentInning === 1 ? 'team1Score' : 'team2Score']: currentInnings.runs
    }, user.email);
    
    // Commentary
    const outBatsmanName = this.getPlayerName(this.selectedOutBatsman);
    const bowlerName = this.getPlayerName(cricketData.currentBowler);
    const newBatsmanName = this.getPlayerName(this.selectedNewBatsman);
    const teamName = cricketData.currentInning === 1 ? this.match.team1?.name : this.match.team2?.name;
    const score = `${currentInnings.runs} for ${currentInnings.wickets}`;
    const overs = this.getCurrentOverDisplay();
    
    this.speak(`Wicket! ${outBatsmanName} is out! Great bowling by ${bowlerName}. ${newBatsmanName} comes to the crease. ${teamName} ${score} after ${overs} overs`);
    
    this.closeWicketModal();
  }

  openEndOverModal() {
    this.showEndOverModal = true;
    this.selectedNextBowler = '';
  }

  closeEndOverModal() {
    this.showEndOverModal = false;
    this.selectedNextBowler = '';
  }

  async confirmEndOver() {
    if (!this.liveScore?.cricketData || !this.selectedNextBowler) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    // Store current state for undo
    this.actionHistory.push({
      type: 'endOver',
      data: JSON.parse(JSON.stringify(this.liveScore.cricketData)),
      newBowler: this.selectedNextBowler,
      previousStriker: this.selectedStriker,
      previousNonStriker: this.selectedNonStriker
    });
    if (this.actionHistory.length > 10) this.actionHistory.shift();

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    const currentInnings = cricketData.currentInning === 1 ? cricketData.team1Innings : cricketData.team2Innings;
    
    // Calculate proper overs from balls
    const totalBalls = cricketData.balls;
    cricketData.overs = Math.floor(totalBalls / 6);
    cricketData.balls = totalBalls % 6;
    
    currentInnings.overs = cricketData.overs;
    currentInnings.balls = cricketData.balls;
    
    // Swap batsmen at end of over
    [cricketData.currentBatsmen[0], cricketData.currentBatsmen[1]] = [cricketData.currentBatsmen[1], cricketData.currentBatsmen[0]];
    [this.selectedStriker, this.selectedNonStriker] = [this.selectedNonStriker, this.selectedStriker];
    
    // Set new bowler
    cricketData.currentBowler = this.selectedNextBowler;
    this.selectedBowler = this.selectedNextBowler;

    await this.liveScoreService.updateScore(this.match.id, { cricketData }, user.email);
    
    // Commentary
    const completedOvers = Math.floor(totalBalls / 6);
    const newBowlerName = this.getPlayerName(this.selectedNextBowler);
    const teamName = cricketData.currentInning === 1 ? this.match.team1?.name : this.match.team2?.name;
    const currentScore = `${currentInnings.runs} for ${currentInnings.wickets}`;
    
    this.speak(`End of over ${completedOvers}. ${teamName} ${currentScore} after ${completedOvers} overs. ${newBowlerName} to bowl the next over`);
    
    this.closeEndOverModal();
  }

  getCricketScore(team: 'team1' | 'team2'): string {
    if (!this.liveScore?.cricketData) return '0/0';
    
    const innings = team === 'team1' ? this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    return `${innings.runs}/${innings.wickets}`;
  }

  getOversDisplay(team: 'team1' | 'team2'): string {
    if (!this.liveScore?.cricketData) return '0.0';
    
    const innings = team === 'team1' ? this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    return `${innings.overs}.${innings.balls}`;
  }

  getCurrentBattingTeam(): string {
    if (!this.liveScore?.cricketData) return '';
    
    return this.liveScore.cricketData.currentInning === 1 ? 
      (this.match.team1?.name || 'Team 1') : 
      (this.match.team2?.name || 'Team 2');
  }

  getBatsmanStats(batsmanName: string): string {
    if (!this.liveScore?.cricketData) return '0* (0)';
    
    const currentInnings = this.liveScore.cricketData.currentInning === 1 ? 
      this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    
    const playerStat = currentInnings.playerStats.find(p => p.playerName === batsmanName);
    if (!playerStat?.batting) return '0* (0)';
    
    const isOut = playerStat.batting.isOut ? '' : '*';
    return `${playerStat.batting.runs}${isOut} (${playerStat.batting.balls})`;
  }
  
  getBowlerStats(bowlerName: string | undefined): string {
    if (!bowlerName || !this.liveScore?.cricketData) return '0-0 (0.0)';
    
    const currentInnings = this.liveScore.cricketData.currentInning === 1 ? 
      this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    
    const playerStat = currentInnings.playerStats.find(p => p.playerName === bowlerName);
    if (!playerStat?.bowling) return '0-0 (0.0)';
    
    const overs = this.getBowlingOvers(playerStat.bowling.overs, playerStat.bowling.balls);
    return `${playerStat.bowling.wickets}-${playerStat.bowling.runs} (${overs})`;
  }
  
  getCurrentTeamPlayers() {
    if (!this.liveScore?.cricketData) return [];
    
    const battingTeam = this.liveScore.cricketData.currentInning === 1 ? this.match.team1 : this.match.team2;
    
    return battingTeam?.playerIds || [];
  }
  
  getBowlingTeamPlayers() {
    if (!this.liveScore?.cricketData) return [];
    
    const bowlingTeam = this.liveScore.cricketData.currentInning === 1 ? this.match.team2 : this.match.team1;
    return bowlingTeam?.playerIds || [];
  }
  
  getBattingStats() {
    return this.getCurrentInningsStats().filter(s => s.batting);
  }
  
  getBowlingStats() {
    return this.getAllBowlingStats().filter(s => s.bowling);
  }
  
  getCurrentInningsStats() {
    if (!this.liveScore?.cricketData) return [];
    
    const currentInnings = this.liveScore.cricketData.currentInning === 1 ? 
      this.liveScore.cricketData.team1Innings : this.liveScore.cricketData.team2Innings;
    
    return currentInnings.playerStats;
  }
  
  getAllBowlingStats() {
    if (!this.liveScore?.cricketData) return [];
    
    const team1Stats = this.liveScore.cricketData.team1Innings.playerStats;
    const team2Stats = this.liveScore.cricketData.team2Innings.playerStats;
    
    return [...team1Stats, ...team2Stats];
  }
  
  getStrikeRate(runs: number, balls: number): string {
    if (balls === 0) return '0.00';
    return ((runs / balls) * 100).toFixed(2);
  }
  
  getBowlingOvers(overs: number, balls: number): string {
    return `${overs}.${balls}`;
  }
  
  getEconomyRate(runs: number, overs: number, balls: number): string {
    const totalOvers = overs + (balls / 6);
    if (totalOvers === 0) return '0.00';
    return (runs / totalOvers).toFixed(2);
  }

  isOverComplete(): boolean {
    if (!this.liveScore?.cricketData) return false;
    const totalBalls = this.liveScore.cricketData.balls;
    return totalBalls >= 6;
  }

  getCurrentOverDisplay(): string {
    if (!this.liveScore?.cricketData) return '0.0';
    const totalBalls = this.liveScore.cricketData.balls;
    const overs = Math.floor(totalBalls / 6);
    const balls = totalBalls % 6;
    return `${overs}.${balls}`;
  }

  async undoLastAction() {
    if (this.actionHistory.length === 0 || !this.liveScore?.cricketData) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const lastAction = this.actionHistory.pop();
    const cricketData = lastAction.data;
    const currentInnings = cricketData.currentInning === 1 ? cricketData.team1Innings : cricketData.team2Innings;

    await this.liveScoreService.updateScore(this.match.id, {
      cricketData,
      [cricketData.currentInning === 1 ? 'team1Score' : 'team2Score']: currentInnings.runs
    }, user.email);
  }
  
  async updateCurrentPlayers() {
    if (!this.liveScore?.cricketData || !this.selectedStriker || !this.selectedNonStriker) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    cricketData.currentBatsmen = [this.selectedStriker, this.selectedNonStriker];

    await this.liveScoreService.updateScore(this.match.id, { cricketData }, user.email);
  }
  
  async updateCurrentBowler() {
    if (!this.liveScore?.cricketData || !this.selectedBowler) return;
    
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;

    const cricketData = JSON.parse(JSON.stringify(this.liveScore.cricketData));
    cricketData.currentBowler = this.selectedBowler;

    await this.liveScoreService.updateScore(this.match.id, { cricketData }, user.email);
  }
  
  private updatePlayerStats(innings: any, playerName: string, runs: number, isWicket: boolean) {
    let playerStat = innings.playerStats.find((p: any) => p.playerName === playerName);
    
    if (!playerStat) {
      playerStat = {
        playerId: playerName,
        playerName: playerName,
        batting: {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false
        }
      };
      innings.playerStats.push(playerStat);
    }
    
    if (!playerStat.batting) {
      playerStat.batting = {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false
      };
    }
    
    playerStat.batting.runs += runs;
    playerStat.batting.balls++;
    
    if (runs === 4) playerStat.batting.fours++;
    if (runs === 6) playerStat.batting.sixes++;
    if (isWicket) playerStat.batting.isOut = true;
  }
  
  private updateBowlerStats(innings: any, bowlerName: string, runs: number, isWicket: boolean) {
    let playerStat = innings.playerStats.find((p: any) => p.playerName === bowlerName);
    
    if (!playerStat) {
      playerStat = {
        playerId: bowlerName,
        playerName: bowlerName,
        bowling: {
          overs: 0,
          balls: 0,
          runs: 0,
          wickets: 0,
          maidens: 0
        }
      };
      innings.playerStats.push(playerStat);
    }
    
    if (!playerStat.bowling) {
      playerStat.bowling = {
        overs: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
        maidens: 0
      };
    }
    
    playerStat.bowling.runs += runs;
    playerStat.bowling.balls++;
    
    if (playerStat.bowling.balls === 6) {
      playerStat.bowling.overs++;
      playerStat.bowling.balls = 0;
    }
    
    if (isWicket) playerStat.bowling.wickets++;
  }
  
  async initializeCricketData() {
    const user = await firstValueFrom(this.userService.user$);
    if (!user?.email) return;
    
    const team1Players = this.match.team1?.playerIds || [];
    const team2Players = this.match.team2?.playerIds || [];
    
    const cricketData: ICricketData = {
      currentInning: 1,
      team1Innings: {
        runs: 0, wickets: 0, overs: 0, balls: 0,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
        playerStats: []
      },
      team2Innings: {
        runs: 0, wickets: 0, overs: 0, balls: 0,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
        playerStats: []
      },
      currentBatsmen: [team1Players[0] || 'Batsman 1', team1Players[1] || 'Batsman 2'],
      currentBowler: team2Players[0] || 'Bowler 1',
      overs: 0,
      balls: 0
    };
    
    await this.liveScoreService.updateScore(this.match.id, {
      cricketData,
      sport: 'Cricket'
    }, user.email);
  }
}