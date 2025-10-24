import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs } from '@angular/fire/firestore';
import { ITournament, IPlayerRegistration } from '../models/group.model';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class PlayerRegistrationService {
  private firestore = inject(Firestore);
  private registrationsCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.PLAYER_REGISTRATIONS);
  private tournamentsCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.TOURNAMENTS);

  async getTournamentById(tournamentId: string): Promise<ITournament | null> {
    try {
      const tournamentRef = doc(this.tournamentsCollection, tournamentId);
      const tournamentSnap = await getDoc(tournamentRef);
      
      if (tournamentSnap.exists()) {
        return { id: tournamentSnap.id, ...tournamentSnap.data() } as ITournament;
      }
      return null;
    } catch (error) {
      throw new Error('Tournament not found');
    }
  }

  async checkExistingRegistration(tournamentId: string, email: string): Promise<boolean> {
    const q = query(
      this.registrationsCollection,
      where('tournamentId', '==', tournamentId),
      where('playerEmail', '==', email)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async registerPlayer(registration: Omit<IPlayerRegistration, 'id'>): Promise<void> {
    const now = new Date();
    await addDoc(this.registrationsCollection, {
      ...registration,
      registrationDate: now,
      createdBy: registration.playerEmail,
      createdOn: now,
      lastUpdatedBy: registration.playerEmail,
      lastUpdatedOn: now
    });
  }
}