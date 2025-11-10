import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, deleteDoc } from '@angular/fire/firestore';
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
      status: 'pending',
      registrationDate: now,
      createdBy: registration.playerEmail,
      createdOn: now,
      lastUpdatedBy: registration.playerEmail,
      lastUpdatedOn: now
    });
  }

  async getRegistrationsByTournament(tournamentId: string): Promise<IPlayerRegistration[]> {
    const q = query(
      this.registrationsCollection,
      where('tournamentId', '==', tournamentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IPlayerRegistration));
  }

  async updateRegistrationStatus(registrationId: string, status: 'approved' | 'rejected'): Promise<void> {
    const registrationRef = doc(this.registrationsCollection, registrationId);
    await updateDoc(registrationRef, { status });
  }

  async deleteRegistration(registrationId: string): Promise<void> {
    const registrationRef = doc(this.registrationsCollection, registrationId);
    await deleteDoc(registrationRef);
  }

  async updatePlayerRegistration(registrationId: string, playerData: Partial<IPlayerRegistration>): Promise<void> {
    const registrationRef = doc(this.registrationsCollection, registrationId);
    await updateDoc(registrationRef, {
      ...playerData,
      lastUpdatedOn: new Date()
    });
  }
    
  async getRegistoredPlayerById(playerId: string): Promise<IPlayerRegistration | null> {
    try {
      const registoredPlayerDoc = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.PLAYER_REGISTRATIONS, playerId);
      const registoredPlayerSnap = await getDoc(registoredPlayerDoc);
      
      if (registoredPlayerSnap.exists()) {
        return { id: registoredPlayerSnap.id, ...registoredPlayerSnap.data() } as IPlayerRegistration;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async bulkRegisterPlayers(tournamentId: string, players: any[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    for (const player of players) {
      try {
        const isAlreadyRegistered = await this.checkExistingRegistration(tournamentId, player.playerEmail);
        
        if (isAlreadyRegistered) {
          results.failed++;
          results.errors.push(`${player.playerName} (${player.playerEmail}) is already registered`);
          continue;
        }
        
        const now = new Date();
        await addDoc(this.registrationsCollection, {
          tournamentId,
          playerName: player.playerName,
          playerEmail: player.playerEmail,
          gender: player.gender,
          mobileNumber: player.mobileNumber,
          registrationDate: now,
          status: 'approved',
          createdBy: 'bulk-upload',
          createdOn: now,
          lastUpdatedBy: 'bulk-upload',
          lastUpdatedOn: now
        });
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to register ${player.playerName}: ${error}`);
      }
    }
    
    return results;
  }
}