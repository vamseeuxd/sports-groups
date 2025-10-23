import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IGroup, IGroupRole, IUser } from '../models/group.model';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, APP_CONSTANTS.COLLECTIONS.USERS);
  
  user$ = user(this.auth);

  getUserGroups(allGroups$: Observable<IGroup[]>): Observable<IGroupRole[]> {
    const userGroups$ = this.user$.pipe(
      switchMap((user) => {
        if (!user?.email) return [];
        const userQuery = query(this.usersCollection, where('email', '==', user.email));
        return collectionData(userQuery, { idField: 'id' });
      })
    );

    return combineLatest([allGroups$, userGroups$]).pipe(
      map(([groups, users]: [IGroup[], any[]]) => {
        return groups
          .filter((group) => users.some((user) => user.groupId === group.id))
          .map((group) => {
            const userRole = users.find((user) => user.groupId === group.id)?.role || 'member';
            return { ...group, role: userRole } as IGroupRole;
          });
      })
    );
  }
}