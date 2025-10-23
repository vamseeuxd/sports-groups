import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ITournament } from '../models/group.model';
import { ValidationService } from './validation.service';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private firestore = inject(Firestore);
  private validation = inject(ValidationService);
  private tournamentsCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.TOURNAMENTS);

  getTournaments(groupId: string): Observable<ITournament[]> {
    const groupQuery = query(
      this.tournamentsCollection, 
      where('groupId', '==', groupId),
      orderBy('createdOn', 'asc')
    );
    return collectionData(groupQuery, { idField: 'id' }) as Observable<ITournament[]>;
  }

  async createTournament(tournament: Omit<ITournament, 'id'>, createdBy: string): Promise<void> {
    const sanitizedName = this.validation.sanitizeInput(tournament.name);
    if (!this.validation.isValidGroupName(sanitizedName)) {
      throw new Error('Invalid tournament name');
    }
    
    const now = new Date();
    await addDoc(this.tournamentsCollection, { 
      ...tournament,
      name: sanitizedName,
      createdBy,
      createdOn: now,
      lastUpdatedBy: createdBy,
      lastUpdatedOn: now
    });
  }

  async updateTournament(tournamentId: string, tournament: Partial<ITournament>, updatedBy: string): Promise<void> {
    const updateData: any = { ...tournament };
    if (tournament.name) {
      updateData.name = this.validation.sanitizeInput(tournament.name);
      if (!this.validation.isValidGroupName(updateData.name)) {
        throw new Error('Invalid tournament name');
      }
    }
    
    const tournamentRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.TOURNAMENTS, tournamentId);
    await updateDoc(tournamentRef, { 
      ...updateData,
      lastUpdatedBy: updatedBy,
      lastUpdatedOn: new Date()
    });
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    const tournamentRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.TOURNAMENTS, tournamentId);
    await deleteDoc(tournamentRef);
  }
}