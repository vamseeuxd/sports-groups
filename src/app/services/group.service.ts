import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, query, where } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { IGroup, IUser } from '../models/group.model';
import { ValidationService } from './validation.service';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private firestore = inject(Firestore);
  private validation = inject(ValidationService);
  private groupsCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.GROUPS);
  private usersCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.USERS);

  getGroups(): Observable<IGroup[]> {
    return collectionData(this.groupsCollection, { idField: 'id' }) as Observable<IGroup[]>;
  }

  async createGroup(name: string, adminEmail: string): Promise<void> {
    const sanitizedName = this.validation.sanitizeInput(name);
    if (!this.validation.isValidGroupName(sanitizedName)) {
      throw new Error('Invalid group name');
    }
    
    const groupRef = await addDoc(this.groupsCollection, { name: sanitizedName });
    await addDoc(this.usersCollection, { 
      email: adminEmail, 
      groupId: groupRef.id, 
      role: 'admin' 
    });
  }

  async updateGroup(groupId: string, name: string): Promise<void> {
    const sanitizedName = this.validation.sanitizeInput(name);
    if (!this.validation.isValidGroupName(sanitizedName)) {
      throw new Error('Invalid group name');
    }
    
    const groupRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.GROUPS, groupId);
    await updateDoc(groupRef, { name: sanitizedName });
  }

  async deleteGroup(groupId: string): Promise<void> {
    const groupRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.GROUPS, groupId);
    await deleteDoc(groupRef);
    
    const usersQuery = query(this.usersCollection, where('groupId', '==', groupId));
    const users = await firstValueFrom(collectionData(usersQuery, { idField: 'id' }));
    
    const deletePromises = users.map(user => {
      if (!user['id']) return Promise.resolve();
      const userRef = doc(this.firestore, APP_CONSTANTS.COLLECTIONS.USERS, user['id']);
      return deleteDoc(userRef);
    });
    
    await Promise.all(deletePromises);
  }

  validateGroupName(name: string, existingGroups: IGroup[], excludeId?: string): { isValid: boolean; error?: string } {
    const sanitizedName = this.validation.sanitizeInput(name);
    
    if (!this.validation.isValidGroupName(sanitizedName)) {
      return { isValid: false, error: APP_CONSTANTS.MESSAGES.ERRORS.INVALID_GROUP_NAME };
    }
    
    if (this.validation.isDuplicateName(sanitizedName, existingGroups, excludeId)) {
      return { isValid: false, error: `${APP_CONSTANTS.MESSAGES.ERRORS.DUPLICATE_GROUP_NAME} "${sanitizedName}"!` };
    }
    
    return { isValid: true };
  }
}