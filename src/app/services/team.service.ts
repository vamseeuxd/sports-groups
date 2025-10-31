import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, getDoc, deleteField } from '@angular/fire/firestore';
import { ITeam } from '../models/group.model';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private firestore = inject(Firestore);
  private teamsCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.TEAMS);

  async getTeamsByTournament(tournamentId: string): Promise<ITeam[]> {
    const q = query(this.teamsCollection, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ITeam));
  }

  async createTeam(team: Omit<ITeam, 'id'>): Promise<void> {
    await addDoc(this.teamsCollection, {
      ...team,
      createdOn: new Date()
    });
  }

  async updateTeam(teamId: string, teamData: Partial<ITeam>): Promise<void> {
    const teamRef = doc(this.teamsCollection, teamId);
    await updateDoc(teamRef, {
      ...teamData,
      lastUpdatedOn: new Date()
    });
  }

  async deleteTeam(teamId: string): Promise<void> {
    const teamRef = doc(this.teamsCollection, teamId);
    await deleteDoc(teamRef);
  }

  async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
    const team = await this.getTeamById(teamId);
    if (team && !team.playerIds.includes(playerId)) {
      await this.updateTeam(teamId, {
        playerIds: [...team.playerIds, playerId]
      });
    }
  }

  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    const team = await this.getTeamById(teamId);
    if (team) {
      const updateData: any = {
        playerIds: team.playerIds.filter(id => id !== playerId)
      };
      
      if (team.captainId === playerId) {
        updateData.captainId = deleteField();
      }
      
      await this.updateTeam(teamId, updateData);
    }
  }

  private async getTeamById(teamId: string): Promise<ITeam | null> {
    try {
      const teamRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.TEAMS, teamId);
      const teamDoc = await getDoc(teamRef);
      return teamDoc.exists() ? { id: teamDoc.id, ...teamDoc.data() } as ITeam : null;
    } catch (error) {
      console.error('Error getting team:', error);
      return null;
    }
  }
}