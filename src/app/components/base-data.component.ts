import { Component, inject } from '@angular/core';
import { ConfirmationModalService } from '../services/confirmation-modal.service';

@Component({
  template: ''
})
export abstract class BaseDataComponent {
  protected confirmationModal = inject(ConfirmationModalService);
  
  loading = false;

  protected async executeWithLoading<T>(operation: () => Promise<T>): Promise<T | null> {
    this.loading = true;
    try {
      return await operation();
    } catch (error) {
      console.error('Operation failed:', error);
      return null;
    } finally {
      this.loading = false;
    }
  }

  protected async confirmDelete(itemName: string, itemType: string = 'item'): Promise<boolean> {
    return await this.confirmationModal.confirm(
      `<i class="bi bi-trash3-fill"></i> Delete ${itemType}`,
      `<h5>Are you sure you want to delete "${itemName}"?</h5>`
    );
  }
}