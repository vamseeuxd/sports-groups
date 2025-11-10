import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc, onSnapshot, collection, query, where, setDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';

export interface ILiveScore {
  matchId: string;
  sport: string;
  team1Score: number;
  team2Score: number;
  currentSet?: number;
  team1Sets?: number;
  team2Sets?: number;
  lastUpdated: Date;
  updatedBy: string;
  cricketData?: ICricketData;
  footballData?: IFootballData;
}

export interface ICricketData {
  currentInning: 1 | 2;
  team1Innings: ICricketInnings;
  team2Innings: ICricketInnings;
  currentBatsmen: string[];
  currentBowler: string;
  overs: number;
  balls: number;
}

export interface ICricketInnings {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: ICricketExtras;
  playerStats: ICricketPlayerStats[];
}

export interface ICricketExtras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export interface ICricketPlayerStats {
  playerId: string;
  playerName: string;
  batting?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    outType?: string;
  };
  bowling?: {
    overs: number;
    balls: number;
    runs: number;
    wickets: number;
    maidens: number;
  };
}

export interface IFootballData {
  team1Goals: number;
  team2Goals: number;
  minute: number;
  half: 1 | 2;
  playerStats: IFootballPlayerStats[];
}

export interface IFootballPlayerStats {
  playerId: string;
  playerName: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

@Injectable({
  providedIn: 'root'
})
export class LiveScoreService {
  private firestore = inject(Firestore);
  private scoresCollection = collection(this.firestore, 'liveScores');

  async updateScore(matchId: string, scoreData: Partial<ILiveScore>, updatedBy: string): Promise<void> {
    const scoreRef = doc(this.firestore, 'liveScores', matchId);
    await setDoc(scoreRef, {
      ...scoreData,
      lastUpdated: new Date(),
      updatedBy
    }, { merge: true });
  }

  getLiveScore(matchId: string): Observable<ILiveScore | null> {
    const scoreRef = doc(this.firestore, 'liveScores', matchId);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(scoreRef, (doc) => {
        if (doc.exists()) {
          observer.next(doc.data() as ILiveScore);
        } else {
          observer.next(null);
        }
      });
      return unsubscribe;
    });
  }

  async startMatch(matchId: string, updatedBy: string): Promise<void> {
    const matchRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.MATCHES, matchId);
    
    await updateDoc(matchRef, { status: 'in-progress' });
  }
}