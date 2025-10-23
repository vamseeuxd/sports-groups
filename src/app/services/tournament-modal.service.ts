import { Injectable } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TournamentModalComponent } from '../components/tournament-modal/tournament-modal.component';
import { ITournament } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentModalService {
  constructor(private modalService: BsModalService) {}

  openAddModal(): Promise<Partial<ITournament> | null> {
    const modalRef: BsModalRef = this.modalService.show(TournamentModalComponent);
    modalRef.content.isEdit = false;

    return new Promise((resolve) => {
      modalRef.onHide?.subscribe(() => {
        resolve(modalRef.content.result);
      });
    });
  }

  openEditModal(tournament: ITournament): Promise<Partial<ITournament> | null> {
    const modalRef: BsModalRef = this.modalService.show(TournamentModalComponent);
    modalRef.content.isEdit = true;
    modalRef.content.tournament = { ...tournament };
    modalRef.content.startDateString = this.formatDate(tournament.startDate);

    return new Promise((resolve) => {
      modalRef.onHide?.subscribe(() => {
        resolve(modalRef.content.result);
      });
    });
  }

  private formatDate(date: any): string {
    if (date && date.toDate) {
      return date.toDate().toISOString().split('T')[0];
    }
    return new Date(date).toISOString().split('T')[0];
  }
}