import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';

@Component({
  selector: 'app-bulk-upload-modal',
  standalone: true,
  imports: [CommonModule, SharedModalComponent],
  template: `
    <app-shared-modal
      [show]="show"
      title="Bulk Upload Players"
      icon="bi-upload"
      modalSize="modal-lg"
      primaryText="Upload Players"
      [primaryAction]="upload"
      [primaryDisabled]="csvData.length === 0 || csvErrors.length > 0"
      [primaryLoading]="uploading"
      (closed)="close()">
      
      <div class="mb-3">
        <label class="form-label">Upload CSV File</label>
        <input type="file" class="form-control" accept=".csv" (change)="onFileSelected($event)" #fileInput>
        <div class="form-text">
          CSV should contain columns: playerName, playerEmail, gender, mobileNumber
          <br>
          <button type="button" class="btn btn-link p-0 text-primary" (click)="downloadSample()">Download sample CSV</button>
        </div>
      </div>
      
      <div *ngIf="csvErrors.length > 0" class="alert alert-danger">
        <h6>Validation Errors:</h6>
        <ul class="mb-0">
          <li *ngFor="let error of csvErrors">{{ error }}</li>
        </ul>
      </div>
      
      <div *ngIf="csvData.length > 0 && csvErrors.length === 0">
        <div class="alert alert-success">
          <i class="bi bi-check-circle"></i> {{ csvData.length }} valid players found
        </div>
        <div class="list-group" style="max-height: 300px; overflow-y: auto;">
          <div *ngFor="let player of csvData" class="list-group-item">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">{{ player.playerName }}</h6>
                <p class="mb-1 text-muted small">{{ player.playerEmail }}</p>
                <small class="text-muted">{{ player.gender | titlecase }} • {{ player.mobileNumber }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-shared-modal>
  `
})
export class BulkUploadModalComponent {
  @Input() show = false;
  @Input() csvData: any[] = [];
  @Input() csvErrors: string[] = [];
  @Input() uploading = false;
  @Output() closed = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() uploadRequested = new EventEmitter<void>();
  @Output() downloadSampleRequested = new EventEmitter<void>();

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  upload = () => {
    this.uploadRequested.emit();
  }

  downloadSample() {
    this.downloadSampleRequested.emit();
  }

  close() {
    this.closed.emit();
  }
}