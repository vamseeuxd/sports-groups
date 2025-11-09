import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { CopyToClipboardDirective } from '../../directives';
import { ITournament } from '../../models';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code-modal',
  standalone: true,
  imports: [CommonModule, SharedModalComponent, CopyToClipboardDirective],
  template: `
    <app-shared-modal
      [show]="show"
      title="Tournament QR Code"
      icon="bi-qr-code"
      [showFooter]="false"
      (closed)="close()">
      
      <div class="text-center d-flex flex-column align-items-center">
        <div *ngIf="tournament" class="mb-1">
          <h5 class="text-dark mb-2">{{tournament.name}}</h5>
          <div class="d-flex justify-content-center align-items-center gap-3 mb-1">
            <span class="badge bg-warning text-dark">{{tournament.sport | titlecase}}</span>
            <span class="text-muted">{{formatDate(tournament.startDate) | date:'MMM dd, yyyy'}}</span>
          </div>
          <p class="text-muted small m-0">{{tournament.description || 'No description available'}}</p>
        </div>
        
        <p class="text-muted mb-3">Scan to register for tournament</p>
        <img [id]="'qr-' + tournamentId" 
             class="img-fluid mb-3 shadow-sm border"
             style="max-width: 200px; height: auto;" 
             alt="Tournament QR Code" />
        <div class="alert alert-warning py-2">
          <small class="text-muted d-block" 
                 appCopyToClipboard="{{tournamentId}}"
                 copySuccessMessage="Tournament ID copied!" 
                 style="cursor: pointer;" 
                 title="Click to copy Tournament ID">
            ID: {{tournamentId}}
            <i class="bi bi-copy ms-1"></i>
          </small>
        </div>
      </div>
    </app-shared-modal>
  `
})
export class QrCodeModalComponent implements OnChanges {
  @Input() show = false;
  @Input() tournamentId: string = '';
  @Input() tournament: ITournament | null = null;
  @Output() closed = new EventEmitter<void>();

  async ngOnChanges() {
    if (this.show && this.tournamentId) {
      await this.generateQRCode();
    }
  }

  private async generateQRCode() {
    setTimeout(async () => {
      try {
        const qrDataURL = await QRCode.toDataURL(this.tournamentId, { 
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        const imgElement = document.getElementById(`qr-${this.tournamentId}`) as HTMLImageElement;
        if (imgElement) {
          imgElement.src = qrDataURL;
          imgElement.style.display = 'block';
        }
      } catch (error) {
        console.error('QR generation error:', error);
      }
    }, 100);
  }

  formatDate(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  close() {
    this.closed.emit();
  }
}