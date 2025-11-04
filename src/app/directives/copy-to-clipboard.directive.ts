import { Directive, Input, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true
})
export class CopyToClipboardDirective {
  @Input('appCopyToClipboard') textToCopy: string = '';
  @Input() copySuccessMessage: string = 'Copied to clipboard!';
  @Input() copyErrorMessage: string = 'Failed to copy';
  @Input() showTooltip: boolean = true;

  private elementRef = inject(ElementRef);

  @HostListener('click', ['$event'])
  async onClick(event: Event) {
    event.preventDefault();
    
    const text = this.textToCopy || this.getElementText();
    
    if (!text) {
      this.showMessage(this.copyErrorMessage, 'error');
      return;
    }

    try {
      await this.copyToClipboard(text);
      this.showMessage(this.copySuccessMessage, 'success');
      this.addCopyAnimation();
    } catch (error) {
      console.error('Copy failed:', error);
      this.showMessage(this.copyErrorMessage, 'error');
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      // Use modern Clipboard API
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (error) {
      throw new Error('Fallback copy failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  private getElementText(): string {
    const element = this.elementRef.nativeElement;
    return element.textContent?.trim() || element.value || '';
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    if (!this.showTooltip) return;

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.className = `copy-tooltip copy-tooltip-${type}`;
    tooltip.style.cssText = `
      position: absolute;
      background: ${type === 'success' ? 'var(--theme-primary)' : '#dc3545'};
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    // Position tooltip
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 10}px`;
    tooltip.style.transform = 'translateX(-50%) translateY(-100%)';

    document.body.appendChild(tooltip);

    // Animate in
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateX(-50%) translateY(-100%) translateY(-5px)';
    });

    // Remove after delay
    setTimeout(() => {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateX(-50%) translateY(-100%) translateY(-10px)';
      setTimeout(() => {
        if (tooltip.parentNode) {
          document.body.removeChild(tooltip);
        }
      }, 300);
    }, 2000);
  }

  private addCopyAnimation(): void {
    const element = this.elementRef.nativeElement;
    element.style.transition = 'all 0.2s ease';
    element.style.transform = 'scale(0.95)';
    element.style.backgroundColor = 'var(--theme-accent)';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      element.style.backgroundColor = '';
    }, 200);
  }
}