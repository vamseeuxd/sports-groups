import { Component, inject, OnInit } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  Query,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { CommonModule } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { switchMap, map, mergeMap } from 'rxjs/operators';
import { from, of, forkJoin, Observable, firstValueFrom, combineLatest } from 'rxjs';

export interface IGroup {
  name: string;
  id?: string;
}
export interface IGroupRole extends IGroup {
  role: string;
}

export type GroupDocument = Query<IGroup, DocumentData>;

@Component({
  selector: 'app-manage-group',
  imports: [CommonModule],
  templateUrl: './manage-group.html',
  styleUrl: './manage-group.scss',
})
export class ManageGroup {
  private auth = inject(Auth);
  user$ = user(this.auth);
  firestore = inject(Firestore);
  loader = inject(LoaderService);
  confirmationModal = inject(ConfirmationModalService);
  groupsCollection = collection(this.firestore, 'groups');
  usersCollection = collection(this.firestore, 'users');
  groups$: Observable<IGroupRole[]>;
  // groups$ = collectionData<IGroup>(this.groupsCollection as GroupDocument, { idField: 'id' });
  editingId: string | null = null;
  groups: IGroupRole[] = [];

  constructor() {
    const allGroups$ = collectionData<IGroup>(this.groupsCollection as GroupDocument, {
      idField: 'id',
    });
    const userGroups$ = this.user$.pipe(
      switchMap((user) => {
        if (!user?.email) return of([]);
        const userQuery = query(this.usersCollection, where('email', '==', user.email));
        return collectionData(userQuery, { idField: 'id' });
      })
    );

    this.groups$ = combineLatest([allGroups$, userGroups$]).pipe(
      map(([groups, users]: [IGroup[], any[]]) => {
        return groups
          .filter((group) => users.some((user) => user.groupId === group.id))
          .map((group) => {
            const userRole = users.find((user) => user.groupId === group.id)?.role || 'member';
            return { ...group, role: userRole } as IGroupRole;
          });
      })
    );

    this.groups$.subscribe((groups) => (this.groups = groups));
  }
  add(nameRef: HTMLInputElement, email: string) {
    const name = nameRef.value.trim();
    if (!name) return;
    if (this.groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      this.confirmationModal.confirm(
        'Duplicate Group',
        `Group name already exists! "${name}"!`,
        true
      );
      return;
    }
    const id = this.loader.show();
    addDoc(this.groupsCollection, <IGroup>{ name }).then((documentReference: DocumentReference) => {
      addDoc(this.usersCollection, { email, groupId: documentReference.id, role: 'admin' }).then(
        () => {
          this.loader.hide(id);
          nameRef.value = '';
        }
      );
    });
  }
  async delete(group: IGroup) {
    if (!group.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-trash3-fill"></i> Delete Group',
      `Are you sure you want to delete "${group.name}"?`
    );
    if (!confirmed) return;
    const id = this.loader.show();
    const groupRef = doc(this.firestore, 'groups', group.id);
    deleteDoc(groupRef).then(async () => {
      // delete all users in the group
      const usersQuery = query(
        this.usersCollection,
        where('groupId', '==', group.id)
      ) as GroupDocument;
      const usersSnapshot = await firstValueFrom(collectionData(usersQuery, { idField: 'id' }));
      console.log(usersSnapshot);

      const deletePromises = (usersSnapshot || []).map((user) => {
        if (!user.id) return Promise.resolve();
        const userRef = doc(this.firestore, 'users', user.id);
        return deleteDoc(userRef);
      });
      Promise.all(deletePromises).then(() => {
        this.loader.hide(id);
      });
    });
  }
  edit(group: IGroup, nameRef: HTMLInputElement) {
    if (!group.id || !nameRef.value.trim()) return;
    const newName = nameRef.value.trim();
    if (
      this.groups.some((g) => g.id !== group.id && g.name.toLowerCase() === newName.toLowerCase())
    ) {
      this.confirmationModal.confirm(
        'Duplicate Group',
        `Group name already exists! "${newName}"!`,
        true
      );
      return;
    }
    const id = this.loader.show();
    const groupRef = doc(this.firestore, 'groups', group.id);
    updateDoc(groupRef, { name: newName }).then(() => {
      this.loader.hide(id);
      this.editingId = null;
    });
  }
}
