import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IKnockoutMatch } from '../models';
import { APP_CONSTANTS } from '../constants/app.constants';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private firestore = inject(Firestore);
  private loaderService = inject(LoaderService);
  private matchesCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.MATCHES);

  async getMatchesByTournament(tournamentId: string): Promise<IKnockoutMatch[]> {
    const q = query(this.matchesCollection, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IKnockoutMatch));
  }

  async createMatch(match: Omit<IKnockoutMatch, 'id'>): Promise<void> {
    const id = this.loaderService.show();
    await addDoc(this.matchesCollection, {
      ...match,
      createdOn: new Date()
    });
    this.loaderService.hide(id);
  }

  async updateMatch(matchId: string, updates: Partial<IKnockoutMatch>): Promise<void> {
    const id = this.loaderService.show();
    const matchRef = doc(this.matchesCollection, matchId);
    await updateDoc(matchRef, {
      ...updates,
      lastUpdatedOn: new Date()
    });
    this.loaderService.hide(id);
  }

  async deleteMatch(matchId: string): Promise<void> {
    const id = this.loaderService.show();
    const matchRef = doc(this.matchesCollection, matchId);
    await deleteDoc(matchRef);
    this.loaderService.hide(id);
  }

  getMatchById(matchId: string): Observable<IKnockoutMatch> {
    const matchRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.MATCHES, matchId);
    return docData(matchRef, { idField: 'id' }) as Observable<IKnockoutMatch>;
  }
}