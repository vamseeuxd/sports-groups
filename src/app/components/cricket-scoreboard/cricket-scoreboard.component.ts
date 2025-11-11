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
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

@Component({
  selector: 'app-cricket-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModalComponent, PopoverModule],
  template: `
    <!-- <app-shared-layout title="Cricket Match" icon="bi-trophy" [actions]="getActionMenuItems()" [loading]="false"> -->
      
    <ng-template #popTemplate>
      <ul class="list-group p-1 shadow border">
        <li *ngFor="let action of getActionMenuItems()" 
            class="list-group-item" 
            [class]="action.class || ''"
            role="button" 
            (click)="contentMenu.hide(); action.handler()">
          <i *ngIf="action.icon" [class]="'bi ' + action.icon + ' me-2'"></i>
          {{ action.label }}
        </li>
      </ul>
    </ng-template>
    <button type="button" 
            class="btn btn-outline-dark border-0 btn-sm position-absolute top-0 end-0 m-1"
            #contentMenu="bs-popover" 
            [popover]="popTemplate" 
            container="body" 
            placement="bottom" 
            [outsideClick]="true">
      <i class="bi bi-three-dots-vertical"></i>
    </button>

      <!-- Match Score Display -->
      <div class="p-1 mb-1">
        <div class="row g-2">
          <div class="col-6">
            <div class="d-flex flex-column justify-content-center align-items-center bg-white p-1 rounded border">
              <h6 class="w-100 d-flex align-items-center ps-2">
                {{ match.team1?.name }}
                <span style="font-size: 0.6rem;" class="ms-2 blink-animation" *ngIf="liveScore?.cricketData?.currentInning === 1">
                  <i class="bi bi-circle-fill text-danger"></i> Batting
                </span>
              </h6>
              <h4 class="m-0 p-0 text-secondary">{{ getCricketScore('team1') }}</h4>
              <small>({{ getOversDisplay('team1') }} overs)</small>
            </div>
          </div>
          <div class="col-6">
            <div class="d-flex flex-column justify-content-center align-items-center bg-white p-1 rounded border">
              <h6 class="w-100 d-flex align-items-center ps-2">
                {{ match.team2?.name }}
                <span style="font-size: 0.6rem;" class="ms-2 blink-animation" *ngIf="liveScore?.cricketData?.currentInning === 2">
                  <i class="bi bi-circle-fill text-danger"></i> Batting
                </span>
              </h6>
              <h4 class="m-0 p-0 text-secondary">{{ getCricketScore('team2') }}</h4>
              <small>({{ getOversDisplay('team2') }} overs)</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Match Status -->
      <div *ngIf="liveScore?.cricketData" class="mb-2">
        <div class="p-3 border rounded bg-white">
          <div class="row">
            <div class="col-md-8">
                  <strong>{{ getCurrentBattingTeam() }} Batting:</strong>
                  <div class="player-stats mt-2">
                    <div *ngFor="let batsman of liveScore?.cricketData?.currentBatsmen || []; let i = index" class="border-bottom pb-1 mb-1 d-flex justify-content-between align-items-center">
                      <span class="text-main fw-medium">{{ getPlayerName(batsman) }}</span>
                      <span class="text-main-dark fw-medium">{{ i === 0 ? '(Striker)' : '(Non-Striker)' }}</span>
                      <span class="text-main-dark fw-medium">{{ getBatsmanStats(batsman) }}</span>
                    </div>
                  </div>
            </div>
            <div class="col-md-4">
              <div>
                <strong>Bowler:</strong>
                <div class="mt-0 d-flex justify-content-between align-items-center">
                  <div class="text-main">{{ getPlayerName(liveScore?.cricketData?.currentBowler) || 'N/A' }}</div>
                  <div class="text-main">{{ getBowlerStats(liveScore?.cricketData?.currentBowler) }}</div>
                </div>                
                <strong>Over:</strong> {{ getCurrentOverDisplay() }}                
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Controls -->
      <div *ngIf="canUpdateScore && match.status === 'in-progress'" class="p-3 border rounded bg-white">
        <h6 class="m-0 p-0 w-100"><i class="bi bi-controller me-2"></i>Scoring Controls</h6>
        
        <div class="runs-section mb-2">
          <label class="control-label">Runs</label>
          <div class="d-flex gap-1">
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-success" (click)="addRuns(0)" [disabled]="isOverComplete()">Dot</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-warning" (click)="addRuns(1)" [disabled]="isOverComplete()">1</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-warning" (click)="addRuns(2)" [disabled]="isOverComplete()">2</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-warning" (click)="addRuns(3)" [disabled]="isOverComplete()">3</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-secondary" (click)="addRuns(4)" [disabled]="isOverComplete()">4</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-dark" (click)="addRuns(6)" [disabled]="isOverComplete()">6</button>
          </div>
        </div>
        
        <div class="mb-2">
          <label class="control-label">Extras</label>
          <div class="d-flex gap-1">
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-outline-secondary" (click)="addExtra('wides')" [disabled]="isOverComplete()">Wide</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-outline-secondary" (click)="addExtra('noBalls')" [disabled]="isOverComplete()">No Ball</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-outline-secondary" (click)="addExtra('byes')" [disabled]="isOverComplete()">Bye</button>
            <button style="font-size: 0.8rem;" class="text-nowrap col btn btn-outline-secondary" (click)="addExtra('legByes')" [disabled]="isOverComplete()">Leg Bye</button>
          </div>
        </div>
        
        <div class="action-section mb-3">
          <div class="row g-2">
            <div class="col-6">
              <button style="font-size: 0.8rem;" class="btn-sm btn btn-danger w-100" (click)="openWicketModal()" [disabled]="isOverComplete()">
                <i class="bi bi-x-circle me-2"></i>Wicket
              </button>
            </div>
            <div class="col-6">
              <button style="font-size: 0.8rem;" class="btn-sm btn btn-info w-100" (click)="openEndOverModal()" [disabled]="!isOverComplete()">
                <i class="bi bi-arrow-right-circle me-2"></i>End Over
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="actionHistory.length > 0" class="undo-section">
          <button style="font-size: 0.8rem;" class="btn-sm btn btn-outline-danger w-100" (click)="undoLastAction()">
            <i class="bi bi-arrow-counterclockwise me-2"></i>Undo Last Action ({{ actionHistory.length }})
          </button>
        </div>
      </div>

      <!-- Initialize Cricket Data -->
      <div *ngIf="canUpdateScore && !liveScore?.cricketData" class="init-section text-center">
        <div class="py-4">
          <i class="bi bi-gear display-4 text-muted mb-3"></i>
          <h5>Initialize Cricket Data</h5>
          <p class="text-muted">Set up the match to start scoring</p>
          <button style="font-size: 0.8rem;" class="btn-sm btn btn-primary" (click)="initializeCricketData()">
            <i class="bi bi-play-circle me-2"></i>Start Match
          </button>
        </div>
      </div>

      <!-- Match Control Buttons -->
      <div *ngIf="canUpdateScore && liveScore?.cricketData" class="match-control-section">
        <div *ngIf="isInningsComplete() && !isBothInningsComplete()" class="text-center mb-3">
          <button style="font-size: 0.8rem;" class="btn-sm btn btn-success btn-lg" (click)="startNextInnings()">
            <i class="bi bi-arrow-right me-2"></i>Start Next Innings
          </button>
        </div>
        <div *ngIf="isBothInningsComplete()" class="text-center">
          <button style="font-size: 0.8rem;" class="btn-sm btn btn-danger btn-lg" (click)="endMatch()">
            <i class="bi bi-trophy me-2"></i>End Match & Announce Winner
          </button>
        </div>
      </div>
    
    <!-- </app-shared-layout> -->

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

    <!-- Voice Selection Modal -->
    <app-shared-modal 
      *ngIf="showVoiceSelectionModal"
      title="Voice Settings"
      [show]="showVoiceSelectionModal"
      [showFooter]="false"
      (closed)="closeVoiceSelectionModal()">
      <div class="modal-body-content">
        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="speechToggle" [(ngModel)]="speechEnabled" (change)="toggleSpeech()">
            <label class="form-check-label" for="speechToggle">
              <i class="bi bi-volume-up me-2"></i>Enable Commentary
            </label>
          </div>
        </div>
        
        <div *ngIf="speechEnabled" class="mb-3">
          <h6><i class="bi bi-translate me-2"></i>Select Language</h6>
          <div class="language-selection">
            <div class="row g-2">
              <div class="col-6">
                <button class="btn w-100" 
                        [class]="selectedLanguage === 'en' ? 'btn-primary' : 'btn-outline-primary'"
                        (click)="selectLanguage('en')">
                  English
                </button>
              </div>
              <div class="col-6">
                <button class="btn w-100" 
                        [class]="selectedLanguage === 'hi' ? 'btn-primary' : 'btn-outline-primary'"
                        (click)="selectLanguage('hi')">
                  हिंदी
                </button>
              </div>
              <div class="col-6">
                <button class="btn w-100" 
                        [class]="selectedLanguage === 'te' ? 'btn-primary' : 'btn-outline-primary'"
                        (click)="selectLanguage('te')">
                  తెలుగు
                </button>
              </div>
              <div class="col-6">
                <button class="btn w-100" 
                        [class]="selectedLanguage === 'ta' ? 'btn-primary' : 'btn-outline-primary'"
                        (click)="selectLanguage('ta')">
                  தமிழ்
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="speechEnabled" class="voice-selection">
          <h6><i class="bi bi-mic me-2"></i>Select Voice</h6>
          <div class="voice-list">
            <div *ngFor="let voice of getFilteredVoices()" 
                 class="voice-item" 
                 [class.selected]="selectedVoice === voice"
                 (click)="selectVoice(voice)">
              <div class="voice-info">
                <div class="voice-name">{{ voice.name }}</div>
                <small class="voice-lang">{{ voice.lang }} - {{ voice.localService ? 'Local' : 'Remote' }}</small>
              </div>
              <button class="btn btn-sm btn-outline-primary" (click)="testVoice(voice); $event.stopPropagation()">
                <i class="bi bi-play"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="closeVoiceSelectionModal()">Close</button>
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
      padding: 0.5rem;
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
      font-size: 1.5rem;
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
    
    .voice-selection {
      margin-top: 1rem;
    }
    
    .voice-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--theme-accent);
      border-radius: 6px;
    }
    
    .voice-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-bottom: 1px solid var(--theme-lighter);
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .voice-item:hover {
      background-color: var(--theme-lighter);
    }
    
    .voice-item.selected {
      background-color: var(--theme-primary);
      color: white;
    }
    
    .voice-item:last-child {
      border-bottom: none;
    }
    
    .voice-info {
      flex: 1;
    }
    
    .voice-name {
      font-weight: 500;
    }
    
    .voice-lang {
      color: var(--theme-muted);
    }
    
    .voice-item.selected .voice-lang {
      color: rgba(255, 255, 255, 0.8);
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
  showVoiceSelectionModal = false;
  speechEnabled = true;
  selectedVoice: SpeechSynthesisVoice | null = null;
  availableVoices: SpeechSynthesisVoice[] = [];
  selectedLanguage = 'en';
  
  private commentary = {
    en: {
      dot: ['Brilliant bowling! Absolutely unplayable!', 'Oh my word! What a delivery!', 'Beaten all ends up! Magnificent bowling!'],
      single: ['Clever batting! Quick thinking between the wickets!', 'Excellent running! They make it look so easy!'],
      two: 'Finds the gap, they\'ll come back for two!',
      three: 'Places it well, running hard for three!',
      boundary: ['MAGNIFICENT! Absolutely stunning shot!', 'GLORIOUS! What a way to find the fence!', 'SPECTACULAR! The crowd erupts in joy!'],
      six: ['UNBELIEVABLE! That ball has been murdered!', 'PHENOMENAL! Into orbit it goes!', 'EXTRAORDINARY! The crowd goes absolutely wild!'],
      wicket: 'Wicket! {outBatsman} is out! Great bowling by {bowler}. {newBatsman} comes to the crease.',
      endOver: 'End of over {overs}. {team} {score} after {overs} overs. {bowler} to bowl the next over',
      commentaryEnabled: 'Commentary enabled'
    },
    hi: {
      dot: ['शानदार गेंदबाजी! बिल्कुल अजेय!', 'अरे वाह! क्या गेंद है!', 'बल्लेबाज का कोई जवाब नहीं!'],
      single: ['चतुर बल्लेबाजी! विकेटों के बीच तेज दौड़!', 'उत्कृष्ट दौड़! वे इसे इतना आसान बनाते हैं!'],
      two: 'गैप मिल गया, दो रन के लिए वापस आएंगे!',
      three: 'अच्छी जगह रखा, तीन के लिए कड़ी मेहनत!',
      boundary: ['चौका! शानदार! बिल्कुल शानदार शॉट!', 'चौका! वाह! बाउंड्री तक पहुंचने का क्या तरीका!', 'चौका! दर्शक खुशी से चिल्ला रहे हैं!'],
      six: ['छक्का! अविश्वसनीय! गेंद का कत्ल हो गया!', 'छक्का! अद्भुत! आसमान में चली गई!', 'छक्का! असाधारण! दर्शक पागल हो गए!'],
      wicket: 'विकेट! {outBatsman} आउट! {bowler} की शानदार गेंदबाजी। {newBatsman} क्रीज़ पर आया।',
      endOver: 'ओवर {overs} समाप्त। {team} {score} {overs} ओवर के बाद। {bowler} अगला ओवर करेगा',
      commentaryEnabled: 'कमेंट्री चालू'
    },
    te: {
      dot: ['అద్భుతమైన బౌలింగ్! పూర్తిగా అజేయం!', 'ఓ మై వర్డ్! ఎంత బంతి!', 'బ్యాట్స్‌మన్‌కు సమాధానం లేదు!'],
      single: ['తెలివైన బ్యాటింగ్! వికెట్ల మధ్య వేగంగా పరుగులు!', 'అద్భుతమైన పరుగులు! వారు దీన్ని చాలా సులభంగా చేస్తారు!'],
      two: 'గ్యాప్ దొరికింది, రెండు పరుగుల కోసం తిరిగి వస్తారు!',
      three: 'బాగా ఉంచారు, మూడు కోసం కష్టపడుతున్నారు!',
      boundary: ['ఫోర్! అద్భుతం! పూర్తిగా అద్భుతమైన షాట్!', 'ఫోర్! అందమైనది! బౌండరీకి చేరుకునే మార్గం!', 'ఫోర్! ప్రేక్షకులు ఆనందంతో అరుస్తున్నారు!'],
      six: ['సిక్స్! నమ్మలేనిది! బంతిని చంపేశారు!', 'సిక్స్! అద్భుతం! ఆకాశంలోకి వెళ్లిపోయింది!', 'సిక్స్! అసాధారణం! ప్రేక్షకులు పిచ్చిగా మారారు!'],
      wicket: 'వికెట్! {outBatsman} అవుట్! {bowler} అద్భుతమైన బౌలింగ్. {newBatsman} క్రీజ్‌కు వచ్చారు.',
      endOver: 'ఓవర్ {overs} ముగిసింది. {team} {score} {overs} ఓవర్ల తర్వాత. {bowler} తదుపరి ఓవర్ వేస్తారు',
      commentaryEnabled: 'వ్యాఖ్యానం ప్రారంభించబడింది'
    },
    ta: {
      dot: ['அற்புதமான பந்துவீச்சு! முற்றிலும் வெல்ல முடியாதது!', 'ஓ மை வேர்ட்! என்ன பந்து!', 'பேட்ஸ்மேனுக்கு பதில் இல்லை!'],
      single: ['புத்திசாலித்தனமான பேட்டிங்! விக்கெட்டுகளுக்கு இடையே வேகமான ஓட்டம்!', 'சிறந்த ஓட்டம்! அவர்கள் இதை மிக எளிதாக செய்கிறார்கள்!'],
      two: 'இடைவெளி கிடைத்தது, இரண்டுக்கு திரும்பி வருவார்கள்!',
      three: 'நன்றாக வைத்தார், மூன்றுக்கு கடினமாக ஓடுகிறார்கள்!',
      boundary: ['அற்புதம்! முற்றிலும் அற்புதமான ஷாட்!', 'அழகானது! எல்லைக்கு செல்லும் வழி!', 'பார்வையாளர்கள் மகிழ்ச்சியில் கூச்சலிடுகிறார்கள்!'],
      six: ['நம்ப முடியாதது! பந்தை கொன்றுவிட்டார்கள்!', 'அற்புதம்! வானத்தில் சென்றுவிட்டது!', 'அசாதாரணம்! பார்வையாளர்கள் பைத்தியமாகிவிட்டார்கள்!'],
      wicket: 'விக்கெட்! {outBatsman} அவுட்! {bowler} அற்புதமான பந்துவீச்சு. {newBatsman} க்ரீஸுக்கு வந்தார்.',
      endOver: 'ஓவர் {overs} முடிந்தது. {team} {score} {overs} ஓவர்களுக்கு பிறகு. {bowler} அடுத்த ஓவர் வீசுவார்',
      commentaryEnabled: 'வர்ணனை இயக்கப்பட்டது'
    }
  };
  
  getActionMenuItems(): Array<{
    label: string;
    icon?: string;
    handler: () => void;
    class?: string;
  }> {
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
      
      // Voice settings
      if ('speechSynthesis' in window) {
        items.push({
          label: 'Voice Settings',
          icon: 'bi-mic',
          handler: () => this.openVoiceSelectionModal()
        });
      }
    }
    
    return items;
  }
  
  private speak(text: string) {
    if (!this.speechEnabled || !('speechSynthesis' in window)) {
      console.log('Speech disabled or not supported');
      return;
    }
    
    console.log('Speaking:', text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    speechSynthesis.speak(utterance);
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
    this.loadVoices();
  }
  
  private loadVoices() {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        this.availableVoices = speechSynthesis.getVoices();
        if (this.availableVoices.length > 0 && !this.selectedVoice) {
          this.selectedVoice = this.availableVoices.find(voice => voice.lang.startsWith('en')) || this.availableVoices[0];
        }
      };
      
      updateVoices();
      speechSynthesis.addEventListener('voiceschanged', updateVoices);
    }
  }
  
  openVoiceSelectionModal() {
    this.showVoiceSelectionModal = true;
  }
  
  closeVoiceSelectionModal() {
    this.showVoiceSelectionModal = false;
  }
  
  selectVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
  }
  
  testVoice(voice: SpeechSynthesisVoice) {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('This is a test of the selected voice');
      utterance.voice = voice;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }
  
  toggleSpeech() {
    this.speechEnabled = !this.speechEnabled;
    if (this.speechEnabled) {
      const lang = this.commentary[this.selectedLanguage as 'en' | 'hi' | 'te' | 'ta'];
      this.speak(lang.commentaryEnabled);
    } else {
      speechSynthesis.cancel();
    }
  }
  
  selectLanguage(langCode: string) {
    this.selectedLanguage = langCode;
    // Update voice to match language if available
    const matchingVoice = this.availableVoices.find(voice => voice.lang.startsWith(langCode));
    if (matchingVoice) {
      this.selectedVoice = matchingVoice;
    }
  }
  
  getFilteredVoices(): SpeechSynthesisVoice[] {
    const filtered = this.availableVoices.filter(voice => voice.lang.startsWith(this.selectedLanguage));
    if (filtered.length > 0) return filtered;
    
    // For Telugu and Tamil, prefer Google voices
    if (this.selectedLanguage === 'te' || this.selectedLanguage === 'ta') {
      const googleVoices = this.availableVoices.filter(voice => 
        voice.name.toLowerCase().includes('google'));
      if (googleVoices.length > 0) return googleVoices;
    }
    
    return this.availableVoices.filter(voice => voice.lang.startsWith('en'));
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
    const lang = this.commentary[this.selectedLanguage as 'en' | 'hi' | 'te' | 'ta'];
    
    if (runs === 0) {
      const comment = lang.dot[Math.floor(Math.random() * lang.dot.length)];
      this.speak(comment);
    } else if (runs === 1) {
      const comment = lang.single[Math.floor(Math.random() * lang.single.length)];
      this.speak(comment);
    } else if (runs === 2) {
      this.speak(lang.two);
    } else if (runs === 3) {
      this.speak(lang.three);
    } else if (runs === 4) {
      const comment = lang.boundary[Math.floor(Math.random() * lang.boundary.length)];
      this.speak(comment);
    } else if (runs === 6) {
      const comment = lang.six[Math.floor(Math.random() * lang.six.length)];
      this.speak(comment);
    }
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
    
    const extraCommentary = {
      en: {
        wide: `Wide! Wayward delivery! ${bowlerName} strays down the leg side. ${teamName} ${score} after ${overs} overs`,
        noBall: `No ball! Overstepped! ${bowlerName} will have to bowl that again, and it's a free hit! ${teamName} ${score} after ${overs} overs`,
        bye: `Bye! Keeper couldn't collect it cleanly, batsmen scamper through for the extra. ${teamName} ${score} after ${overs} overs`,
        legBye: `Leg bye! Off the pads, appeal for LBW but going down leg, they'll take the run. ${teamName} ${score} after ${overs} overs`
      },
      hi: {
        wide: `वाइड! गलत दिशा में गेंद! ${bowlerName} लाइन से भटक गया। ${teamName} ${score} ${overs} ओवर के बाद`,
        noBall: `नो बॉल! लाइन पार कर गया! ${bowlerName} को दोबारा डालना होगा, और यह फ्री हिट है! ${teamName} ${score} ${overs} ओवर के बाद`,
        bye: `बाई! विकेटकीपर साफ नहीं पकड़ सका, बल्लेबाज अतिरिक्त रन के लिए दौड़े। ${teamName} ${score} ${overs} ओवर के बाद`,
        legBye: `लेग बाई! पैड से लगी, एलबीडब्ल्यू की अपील लेकिन लेग साइड जा रही है, रन लेंगे। ${teamName} ${score} ${overs} ओवर के बाद`
      },
      te: {
        wide: `వైడ్! దిశ తప్పిన బంతి! ${bowlerName} లైన్ తప్పించాడు। ${teamName} ${score} ${overs} ఓవర్ల తర్వాత`,
        noBall: `నో బాల్! లైన్ దాటాడు! ${bowlerName} మళ్లీ వేయాల్సి వస్తుంది, మరియు ఇది ఫ్రీ హిట్! ${teamName} ${score} ${overs} ఓవర్ల తర్వాత`,
        bye: `బై! వికెట్ కీపర్ సరిగ్గా పట్టుకోలేకపోయాడు, బ్యాట్స్మెన్లు అదనపు రన్ కోసం పరుగెత్తారు। ${teamName} ${score} ${overs} ఓవర్ల తర్వాత`,
        legBye: `లెగ్ బై! ప్యాడ్స్కు తగిలింది, ఎల్బీడబ్ల్యూ అప్పీల్ కానీ లెగ్ సైడ్కు వెళ్తోంది, రన్ తీసుకుంటారు। ${teamName} ${score} ${overs} ఓవర్ల తర్వాత`
      },
      ta: {
        wide: `வைட்! திசை தவறிய பந்து! ${bowlerName} லைனை விட்டு விலகினார். ${teamName} ${score} ${overs} ஓவர்களுக்கு பிறகு`,
        noBall: `நோ பால்! லைனை தாண்டினார்! ${bowlerName} மீண்டும் வீச வேண்டும், இது ஃப்ரீ ஹிட்! ${teamName} ${score} ${overs} ஓவர்களுக்கு பிறகு`,
        bye: `பை! விக்கெட் கீப்பர் சரியாக பிடிக்க முடியவில்லை, பேட்ஸ்மேன்கள் கூடுதல் ரனுக்காக ஓடினார்கள். ${teamName} ${score} ${overs} ஓவர்களுக்கு பிறகு`,
        legBye: `லெக் பை! பேட்ஸில் பட்டது, எல்பிடபிள்யூ அப்பீல் ஆனால் லெக் சைடுக்கு போகிறது, ரன் எடுப்பார்கள். ${teamName} ${score} ${overs} ஓவர்களுக்கு பிறகு`
      }
    };
    
    const langComments = extraCommentary[this.selectedLanguage as 'en' | 'hi' | 'te' | 'ta'];
    
    if (type === 'wides') this.speak(langComments.wide);
    else if (type === 'noBalls') this.speak(langComments.noBall);
    else if (type === 'byes') this.speak(langComments.bye);
    else if (type === 'legByes') this.speak(langComments.legBye);
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
    
    const lang = this.commentary[this.selectedLanguage as 'en' | 'hi' | 'te' | 'ta'];
    const inningsEndText = this.selectedLanguage === 'en' ? 
      `End of first innings. ${this.match.team1?.name} scored ${cricketData.team1Innings.runs} for ${cricketData.team1Innings.wickets}. ${this.match.team2?.name} needs ${cricketData.team1Innings.runs + 1} runs to win.` :
      this.selectedLanguage === 'hi' ?
      `पहली पारी समाप्त। ${this.match.team1?.name} ने ${cricketData.team1Innings.runs} रन बनाए ${cricketData.team1Innings.wickets} विकेट पर। ${this.match.team2?.name} को जीतने के लिए ${cricketData.team1Innings.runs + 1} रन चाहिए।` :
      this.selectedLanguage === 'te' ?
      `మొదటి ఇన్నింగ్స్ ముగిసింది. ${this.match.team1?.name} ${cricketData.team1Innings.runs} పరుగులు చేసింది ${cricketData.team1Innings.wickets} వికెట్లకు. ${this.match.team2?.name}కు గెలవడానికి ${cricketData.team1Innings.runs + 1} పరుగులు కావాలి.` :
      `முதல் இன்னிங்ஸ் முடிந்தது. ${this.match.team1?.name} ${cricketData.team1Innings.runs} ரன்கள் எடுத்தது ${cricketData.team1Innings.wickets} விக்கெட்டுகளுக்கு. ${this.match.team2?.name}க்கு வெல்ல ${cricketData.team1Innings.runs + 1} ரன்கள் தேவை.`;
    this.speak(inningsEndText);
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
    
    const matchEndText = this.selectedLanguage === 'en' ? 
      `Match completed! ${winnerName} wins ${margin}. What a fantastic game of cricket!` :
      this.selectedLanguage === 'hi' ?
      `मैच समाप्त! ${winnerName} ${margin} से जीता। क्या शानदार क्रिकेट मैच था!` :
      this.selectedLanguage === 'te' ?
      `మ్యాచ్ పూర్తయింది! ${winnerName} ${margin} తో గెలిచింది. ఎంత అద్భుతమైన క్రికెట్ ఆట!` :
      `போட்டி முடிந்தது! ${winnerName} ${margin} வித்தியாசத்தில் வென்றது. என்ன அருமையான கிரிக்கெட் ஆட்டம்!`;
    this.speak(matchEndText);
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
    
    const lang = this.commentary[this.selectedLanguage as 'en' | 'hi' | 'te' | 'ta'];
    const wicketText = lang.wicket
      .replace('{outBatsman}', outBatsmanName)
      .replace('{bowler}', bowlerName)
      .replace('{newBatsman}', newBatsmanName);
    this.speak(`${wicketText} ${teamName} ${score} after ${overs} overs`);
    
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
    
    const lang = this.commentary[this.selectedLanguage as 'en' | 'hi' | 'te' | 'ta'];
    const endOverText = lang.endOver
      .replace('{overs}', completedOvers.toString())
      .replace('{team}', teamName || '')
      .replace('{score}', currentScore)
      .replace('{bowler}', newBowlerName);
    this.speak(endOverText);
    
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