import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title" [innerHTML]="title"></h4>
    </div>
    <div class="modal-body">
      <p [innerHTML]="message"></p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="decline()">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="confirm()">Confirm</button>
    </div>
  `,
  standalone: true
})
export class ConfirmationModalComponent {
  title = 'Confirm Action';
  message = 'Are you sure?';
  result = false;

  constructor(public bsModalRef: BsModalRef) {}

  confirm() {
    this.result = true;
    this.bsModalRef.hide();
  }

  decline() {
    this.result = false;
    this.bsModalRef.hide();
  }
}