import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc, onSnapshot, collection, query, where, setDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';

export interface ILiveScore {
  matchId: string;
  team1Score: number;
  team2Score: number;
  currentSet?: number;
  team1Sets?: number;
  team2Sets?: number;
  lastUpdated: Date;
  updatedBy: string;
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
    const scoreRef = doc(this.firestore, 'liveScores', matchId);
    
    await Promise.all([
      updateDoc(matchRef, { status: 'in-progress' }),
      setDoc(scoreRef, {
        matchId,
        team1Score: 0,
        team2Score: 0,
        currentSet: 1,
        team1Sets: 0,
        team2Sets: 0,
        lastUpdated: new Date(),
        updatedBy
      })
    ]);
  }
}