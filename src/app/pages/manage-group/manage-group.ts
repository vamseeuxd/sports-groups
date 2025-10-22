import { Component, inject } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  Query,
} from '@angular/fire/firestore';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { CommonModule } from '@angular/common';

export interface IGroup {
  name: string;
  id?: string;
}

export type GroupDocument = Query<IGroup, DocumentData>;

@Component({
  selector: 'app-manage-group',
  imports: [
    CommonModule
  ],
  templateUrl: './manage-group.html',
  styleUrl: './manage-group.scss',
})
export class ManageGroup {
  firestore = inject(Firestore);
  loader = inject(LoaderService);
  confirmationModal = inject(ConfirmationModalService);
  groupsCollection = collection(this.firestore, 'groups');
  groups$ = collectionData<IGroup>(this.groupsCollection as GroupDocument, { idField: 'id' });
  add(nameRef: HTMLInputElement) {
    const name = nameRef.value.trim();
    if (!name) return;
    const id = this.loader.show();
    addDoc(this.groupsCollection, <IGroup>{ name }).then((documentReference: DocumentReference) => {
      this.loader.hide(id);
      nameRef.value = '';
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
    deleteDoc(groupRef).then(() => this.loader.hide(id));
  }
}
