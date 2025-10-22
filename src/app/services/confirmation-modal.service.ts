import { Injectable } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  constructor(private modalService: BsModalService) {}

  confirm(title: string = 'Confirm Action', message: string = 'Are you sure?', isAlert=false): Promise<boolean> {
    const modalRef: BsModalRef = this.modalService.show(ConfirmationModalComponent);
    modalRef.content.title = title;
    modalRef.content.message = message;
    modalRef.content.isAlert = isAlert;

    return new Promise((resolve) => {
      modalRef.onHide?.subscribe(() => {
        resolve(modalRef.content.result);
      });
    });
  }
}